import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { cx } from '@/ds/utils/cx'

// A liquid contour field that follows the pointer: the contours bend and swirl around the cursor, a soft light sits
// under it, a comet-like trail stretches behind fast moves, and ripples roll out when it moves. When the pointer is
// away, the light drifts on its own along a slow loop. WebGL2 draws it (one full-screen fragment shader); GSAP smooths
// the cursor (quickTo), drives the movement energy and the idle drift, and renders on its ticker.
// Pauses off screen; draws one still frame under reduced motion.

const VERT = `#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uHead;        // cursor light, field space (x scaled by aspect, centred, y up)
uniform vec2 uTail;        // slower follower: the trail runs from tail to head
uniform float uEnergy;     // 0..1, how hard the pointer is moving
uniform float uIntro;
uniform vec3 uLine, uLight, uGlow;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.02 + 11.7; a *= 0.5; }
  return v;
}
// Distance from p to the segment a→b
float segment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-5), 0.0, 1.0);
  return length(pa - ba * h);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  float t = uTime;

  // Swirl the field around the cursor; stronger while it moves
  vec2 d = p - uHead;
  float r = length(d);
  float pull = exp(-r * r * 9.0);
  float ang = pull * (0.9 + 2.2 * uEnergy);
  float s = sin(ang), c = cos(ang);
  vec2 q = uHead + mat2(c, -s, s, c) * d;
  q += normalize(d + 1e-4) * pull * 0.06;

  // Ripples rolling out from the cursor while it moves
  float ripple = sin(r * 46.0 - t * 7.0) * exp(-r * 5.0) * uEnergy;
  q += normalize(d + 1e-4) * ripple * 0.012;

  // Liquid contours
  vec2 w = vec2(fbm(q * 1.4 + t * 0.05), fbm(q * 1.4 + vec2(4.1, 2.3) - t * 0.04));
  float f = fbm(q * 1.8 + w * 1.6 + vec2(0.0, t * 0.03));
  float bands = f * 14.0;
  float lineDist = abs(fract(bands) - 0.5) / max(fwidth(bands), 1e-4);
  float line = 1.0 - smoothstep(0.0, 1.2, lineDist);

  // Light under the cursor, trail behind it
  float spot = exp(-r * r * 7.0);
  float trail = exp(-segment(p, uTail, uHead) * 26.0) * (0.25 + 0.75 * uEnergy);
  float near = clamp(spot * 1.2 + trail, 0.0, 1.0);

  vec3 col = uLine * line * (0.10 + 0.9 * near);            // contours: faint far away, lit near the cursor
  col += uGlow * spot * 0.55;                               // soft pool of light
  col += uLight * trail * 0.35;                             // comet trail
  col += uLight * exp(-r * r * 220.0) * (0.5 + 0.5 * uEnergy); // bright core

  float edge = smoothstep(0.0, 0.1, uv.x) * smoothstep(1.0, 0.9, uv.x) * smoothstep(0.0, 0.12, uv.y) * smoothstep(1.0, 0.9, uv.y);
  col *= edge * uIntro;
  float a = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);
  outColor = vec4(clamp(col, 0.0, 1.0), a);
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

export type MouseFieldProps = {
  /** Contour colour. Any CSS colour, including `var(--token)`. */
  lineColor?: string
  /** Cursor core and trail. */
  lightColor?: string
  /** The soft pool of light under the cursor. */
  glowColor?: string
  /** Seconds the light takes to catch up with the pointer. */
  follow?: number
  /** Draw a single settled frame and ignore the pointer (reduced motion). */
  still?: boolean
  className?: string
}

export function MouseField({
  lineColor = 'var(--ldg-fg-inverse-accent)',
  lightColor = 'var(--ldg-fg-inverse)',
  glowColor = 'var(--ldg-fg-inverse-accent)',
  follow = 0.7,
  still = false,
  className,
}: MouseFieldProps) {
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
    gl.uniform3fv(u('uLine'), resolveColor(lineColor, host))
    gl.uniform3fv(u('uLight'), resolveColor(lightColor, host))
    gl.uniform3fv(u('uGlow'), resolveColor(glowColor, host))

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

    // State GSAP tweens; the shader reads it every frame. Head and tail start off-centre, upper right.
    const s = { t: 30, hx: 0.35, hy: 0.15, tx: 0.35, ty: 0.15, energy: 0, intro: still ? 1 : 0 }
    const draw = () => {
      resize()
      gl.uniform1f(u('uTime'), s.t)
      gl.uniform2f(u('uHead'), s.hx, s.hy)
      gl.uniform2f(u('uTail'), s.tx, s.ty)
      gl.uniform1f(u('uEnergy'), s.energy)
      gl.uniform1f(u('uIntro'), s.intro)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    if (still) {
      draw()
      const ro = new ResizeObserver(draw)
      ro.observe(canvas)
      return () => {
        ro.disconnect()
        gl.deleteBuffer(buf)
        gl.deleteProgram(prog)
      }
    }

    let idle: gsap.core.Tween | undefined
    let idleTimer: gsap.core.Tween | undefined
    const ctx = gsap.context(() => {})
    const headX = gsap.quickTo(s, 'hx', { duration: follow, ease: 'power3.out' })
    const headY = gsap.quickTo(s, 'hy', { duration: follow, ease: 'power3.out' })
    const tailX = gsap.quickTo(s, 'tx', { duration: follow * 2.4, ease: 'power3.out' })
    const tailY = gsap.quickTo(s, 'ty', { duration: follow * 2.4, ease: 'power3.out' })
    const aim = (x: number, y: number) => {
      headX(x)
      headY(y)
      tailX(x)
      tailY(y)
    }

    ctx.add(() => {
      gsap.to(s, { intro: 1, duration: 1.6, ease: 'power2.out' })
      gsap.to(s, { t: '+=1000', duration: 1000, ease: 'none', repeat: -1 })
    })

    // With no pointer, the light wanders a slow figure-eight
    const startIdle = () => {
      if (idle) return
      const loop = { a: Math.atan2(s.hy, s.hx) }
      idle = gsap.to(loop, {
        a: `+=${Math.PI * 2}`,
        duration: 14,
        ease: 'none',
        repeat: -1,
        onUpdate: () => {
          const r = canvas.clientWidth / Math.max(canvas.clientHeight, 1)
          aim(Math.cos(loop.a) * 0.36 * r, Math.sin(loop.a * 2) * 0.22)
        },
      })
    }
    const stopIdle = () => {
      idle?.kill()
      idle = undefined
    }
    startIdle()

    let last = { x: 0, y: 0, t: 0 }
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom
      if (!inside) return
      stopIdle()
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * (rect.width / rect.height)
      const y = 0.5 - (e.clientY - rect.top) / rect.height
      aim(x, y)
      // Energy from pointer speed (field units per second), eased up quickly and let down slowly
      const now = performance.now()
      const dt = Math.max(now - last.t, 16) / 1000
      const speed = Math.hypot(x - last.x, y - last.y) / dt
      last = { x, y, t: now }
      gsap.to(s, { energy: Math.min(1, Math.max(s.energy, speed * 0.6)), duration: 0.25, ease: 'power2.out', overwrite: 'auto' })
      gsap.to(s, { energy: 0, duration: 1.6, delay: 0.25, ease: 'power2.inOut', overwrite: false })
      idleTimer?.kill()
      idleTimer = gsap.delayedCall(2.5, startIdle)
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    // GSAP's ticker renders; the clock pauses while the field is off screen
    let running = false
    const setRunning = (on: boolean) => {
      if (on === running) return
      running = on
      if (on) gsap.ticker.add(draw)
      else gsap.ticker.remove(draw)
      ctx.data.forEach((a: gsap.core.Animation) => (on ? a.resume() : a.pause()))
      if (on) startIdle()
      else stopIdle()
    }
    const io = new IntersectionObserver(([e]) => setRunning(e.isIntersecting))
    io.observe(canvas)
    draw()

    return () => {
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      gsap.ticker.remove(draw)
      stopIdle()
      idleTimer?.kill()
      gsap.killTweensOf(s)
      ctx.revert()
      // Free resources but keep the context: a lost context can't be reacquired on remount
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
    }
  }, [lineColor, lightColor, glowColor, follow, still])

  return <canvas ref={ref} aria-hidden className={cx('block size-full', className)} />
}
