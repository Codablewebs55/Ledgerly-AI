import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { cx } from '@/ds/utils/cx'

// Faint current lines with charges running along them. WebGL2 draws the lines (one full-screen fragment
// shader); GSAP drives each charge's position, timing and brightness, and owns the render loop via its ticker.
// Pauses off screen; draws one still frame under reduced motion.

const LINES = 6

const VERT = `#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;

#define LINES ${LINES}
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uColor, uHot;
uniform float uHead[LINES];    // charge position along each line, 0..1 (outside = off the line)
uniform float uPower[LINES];   // charge brightness 0..1
uniform float uOpacity;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float px = 1.0 / uRes.y;
  vec3 col = vec3(0.0);
  float alpha = 0.0;

  for (int i = 0; i < LINES; i++) {
    float fi = float(i);
    float head = uHead[i];
    // Lines bunch together on the left and fan out to the right edge
    float spread = mix(0.25, 1.0, smoothstep(0.0, 1.0, uv.x));
    float lane = (fi / float(LINES - 1) - 0.5) * 0.78 * spread + 0.5;
    float y = lane + 0.035 * sin(uv.x * 4.2 + fi * 1.9 + uTime * 0.35);

    // Electric jitter, strongest around the charge
    float near = exp(-pow((uv.x - head) * 7.0, 2.0)) * uPower[i];
    y += (noise(vec2(uv.x * 46.0 + fi * 13.0, uTime * 14.0)) - 0.5) * (0.004 + 0.03 * near);

    float d = abs(uv.y - y) / px;                    // distance to the line in device px
    float core = 1.0 - smoothstep(0.4, 1.4, d);
    float glow = exp(-d / 7.0);

    // The charge: a bright head with a tail that trails behind it
    float behind = head - uv.x;
    float tail = behind >= -0.01 ? exp(-max(behind, 0.0) * 9.0) * uPower[i] : 0.0;
    float spark = exp(-pow((uv.x - head) * 38.0, 2.0)) * uPower[i];

    float a = core * (0.14 + 0.86 * tail) + glow * (0.55 * tail + 0.9 * spark);
    col += mix(uColor, uHot, clamp(spark + tail * 0.25, 0.0, 1.0)) * a;
    alpha += a;
  }

  // Fade in from the copy side and soften the other edges
  float edge = smoothstep(0.0, 0.4, uv.x) * smoothstep(1.0, 0.94, uv.x) * smoothstep(0.0, 0.1, uv.y) * smoothstep(1.0, 0.9, uv.y);
  alpha = clamp(alpha * edge * uOpacity, 0.0, 1.0);
  outColor = vec4(clamp(col * edge * uOpacity, 0.0, 1.0), alpha);
}`

/** Resolves any CSS colour, including `var(--token)`, to 0–1 RGB. */
function resolveColor(color: string, host: HTMLElement): [number, number, number] {
  const probe = document.createElement('span')
  probe.style.color = color
  host.appendChild(probe)
  const m = getComputedStyle(probe).color.match(/[\d.]+/g) ?? ['255', '255', '255']
  probe.remove()
  return [Number(m[0]) / 255, Number(m[1]) / 255, Number(m[2]) / 255]
}

export type ElectricLinesProps = {
  /** Line colour. Any CSS colour, including `var(--token)`. */
  color?: string
  /** Colour at the hot head of each charge. */
  hotColor?: string
  opacity?: number
  /** Seconds for a charge to cross the field; each line varies around this. */
  duration?: number
  /** Draw a single settled frame (reduced motion). */
  still?: boolean
  className?: string
}

export function ElectricLines({
  color = 'var(--ldg-fg-inverse-accent)',
  hotColor = 'var(--ldg-fg-inverse)',
  opacity = 1,
  duration = 2.6,
  still = false,
  className,
}: ElectricLinesProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const gl = canvas?.getContext('webgl2', { antialias: false, premultipliedAlpha: true, alpha: true })
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
    const host = canvas.parentElement ?? document.body
    gl.uniform3fv(u('uColor'), resolveColor(color, host))
    gl.uniform3fv(u('uHot'), resolveColor(hotColor, host))
    gl.uniform1f(u('uOpacity'), opacity)

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
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

    // Charge state GSAP tweens; the shader reads it every frame
    const heads = new Float32Array(LINES).fill(-1)
    const power = new Float32Array(LINES)
    const charges = Array.from({ length: LINES }, (_, i) => ({ i, head: -0.3, power: 0 }))
    const clock = { t: 0 }

    const draw = () => {
      resize()
      charges.forEach((c) => {
        heads[c.i] = c.head
        power[c.i] = c.power
      })
      gl.uniform1f(u('uTime'), clock.t)
      gl.uniform1fv(u('uHead'), heads)
      gl.uniform1fv(u('uPower'), power)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    if (still) {
      charges.forEach((c, i) => {
        c.head = 0.35 + ((i * 0.37) % 0.55)
        c.power = 0.8
      })
      clock.t = 12
      draw()
      const ro = new ResizeObserver(draw)
      ro.observe(canvas)
      return () => {
        ro.disconnect()
        gl.deleteBuffer(buf)
        gl.deleteProgram(prog)
      }
    }

    // Each line fires a charge left → right, flaring in and fading out, then rests a beat and goes again
    const ctx = gsap.context(() => {
      charges.forEach((c, i) => {
        const run = duration * gsap.utils.random(0.8, 1.25)
        gsap
          .timeline({ repeat: -1, repeatDelay: gsap.utils.random(0.2, 1.2), delay: i * 0.4 + gsap.utils.random(0, 0.6) })
          .fromTo(c, { head: -0.15 }, { head: 1.15, duration: run, ease: 'power1.inOut' }, 0)
          .fromTo(c, { power: 0 }, { power: 1, duration: run * 0.25, ease: 'power2.out' }, 0)
          .to(c, { power: 0, duration: run * 0.3, ease: 'power2.in' }, run * 0.7)
      })
      gsap.to(clock, { t: '+=1000', duration: 1000, ease: 'none', repeat: -1 })
    })

    // GSAP's ticker renders; everything pauses while the card is off screen
    let running = false
    const setRunning = (on: boolean) => {
      if (on === running) return
      running = on
      if (on) gsap.ticker.add(draw)
      else gsap.ticker.remove(draw)
      ctx.data.forEach((a: gsap.core.Animation) => (on ? a.resume() : a.pause()))
    }
    const io = new IntersectionObserver(([e]) => setRunning(e.isIntersecting))
    io.observe(canvas)
    draw()

    return () => {
      io.disconnect()
      gsap.ticker.remove(draw)
      ctx.revert()
      // Free resources but keep the context: a lost context can't be reacquired on remount
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
    }
  }, [color, hotColor, opacity, duration, still])

  return <canvas ref={ref} aria-hidden className={cx('block size-full', className)} />
}
