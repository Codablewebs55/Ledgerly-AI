import { useEffect, useRef } from 'react'
import { cx } from '@/ds/utils/cx'

// "Tangle → ledger line": fine threads that wander on the left and converge
// into one straight lime rule on the right. Plain WebGL, no library. Colours
// come from the semantic tokens at runtime, so the shader follows the theme.

const VERT = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uBg;
uniform vec3 uThread;
uniform vec3 uAccent;
uniform float uLine;
uniform float uIntro;

float hash(float n) { return fract(sin(n) * 43758.5453); }

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  // Threads wander freely on the left and are pulled onto one line on the right. On load (uIntro 0 → 1) the whole
  // field starts as a tangle and the pull sweeps in, so the line resolves out of the noise.
  float settle = smoothstep(0.08, 0.92, uv.x) * uIntro;
  float target = uLine;
  vec3 col = uBg;
  float lineGlow = 0.0;
  for (int i = 0; i < 28; i++) {
    float fi = float(i);
    float seed = hash(fi * 7.13);
    float freq = 2.2 + seed * 3.4;
    float phase = seed * 6.2831 + uTime * (0.10 + seed * 0.16);
    float wander = sin(uv.x * freq * aspect + phase) * 0.22 + sin(uv.x * freq * 2.3 - phase * 1.4) * 0.07;
    float y = mix(target + (seed - 0.5) * 1.3 + wander, target, settle);
    float d = abs(uv.y - y) * uRes.y;
    float w = 0.6 + seed * 0.5;
    float a = smoothstep(w + 1.0, w * 0.2, d) * (0.22 + 0.32 * seed) * (1.0 - settle * 0.5);
    col = mix(col, uThread, a);
    lineGlow += smoothstep(3.0, 0.0, d) * settle;
  }
  // The resolved ledger line itself, brightening as the threads arrive
  float dl = abs(uv.y - target) * uRes.y;
  float line = smoothstep(1.4, 0.3, dl) * smoothstep(0.35, 0.95, uv.x) * uIntro;
  col = mix(col, uAccent, clamp(line * 0.9 + lineGlow * 0.015, 0.0, 0.9));
  // Soft vignette keeps the edges calm behind the product
  float v = smoothstep(1.25, 0.35, length((uv - 0.5) * vec2(1.0, 1.4)));
  col = mix(uBg, col, 0.55 + 0.45 * v);
  gl_FragColor = vec4(col, 1.0);
}`

function tokenRgb(name: string): [number, number, number] {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const hex = raw.startsWith('#') ? raw.slice(1) : '000000'
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex
  const n = parseInt(full.slice(0, 6), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export type ThreadsFieldProps = {
  /** Vertical position of the resolved line, 0 (bottom) to 1 (top). */
  line?: number
  /** Draw a single still frame instead of animating (reduced motion, small screens). */
  still?: boolean
  className?: string
}

/** Animated thread field drawn behind product compositions. Pauses off screen. */
export function ThreadsField({ line = 0.5, still = false, className }: ThreadsFieldProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const gl = canvas?.getContext('webgl', { antialias: false, premultipliedAlpha: false })
    if (!canvas || !gl) return

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const u = (n: string) => gl.getUniformLocation(prog, n)
    gl.uniform3fv(u('uBg'), tokenRgb('--ldg-bg-inverse-raised'))
    gl.uniform3fv(u('uThread'), tokenRgb('--ldg-fg-inverse-muted'))
    gl.uniform3fv(u('uAccent'), tokenRgb('--ldg-fg-inverse-accent'))
    gl.uniform1f(u('uLine'), line)

    // Cap density: the field is soft by design, 1.5x is indistinguishable from 2x
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const resize = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
      gl.uniform2f(u('uRes'), w, h)
    }
    // Load intro: the tangle resolves into the line over INTRO_MS, eased out (cubic). A still field is resolved already.
    const INTRO_MS = 2600
    const born = performance.now()
    const intro = () => (still ? 1 : 1 - (1 - Math.min(1, (performance.now() - born) / INTRO_MS)) ** 3)
    const draw = (t: number) => {
      resize()
      gl.uniform1f(u('uTime'), t / 1000)
      gl.uniform1f(u('uIntro'), intro())
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    let frame = 0
    let visible = false
    const loop = (t: number) => {
      draw(t)
      frame = visible ? requestAnimationFrame(loop) : 0
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !still && !frame) frame = requestAnimationFrame(loop)
    })
    draw(4200)
    if (!still) io.observe(canvas)
    const ro = new ResizeObserver(() => still && draw(4200))
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(frame)
      io.disconnect()
      ro.disconnect()
      // Free resources but keep the context: a lost context can't be reacquired on remount
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
    }
  }, [line, still])

  return <canvas ref={ref} aria-hidden className={cx('block size-full bg-inverse-raised', className)} />
}
