import { useEffect, useRef } from 'react'
import { cx } from '@/ds/utils/cx'

// Flowing field lines that drift in one direction, bend away from the pointer and swirl where you click.
// Plain WebGL2 (one full-screen fragment shader), no library. Pauses off screen; draws one still frame
// under reduced motion.

const VERT = `#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2 uRes;
uniform float uTime;
uniform vec3 uC0, uC1, uC2;
uniform float uGlow, uRim, uLineWidth, uScale, uTurb, uFluid, uSharp, uShimmer;
uniform float uDir;            // 0 down, 1 up, 2 left, 3 right
uniform vec3 uMouse;           // xy in field space, z = presence 0..1
uniform float uMouseStrength, uMouseRadius;
uniform vec3 uSwirl;           // xy click point, z = age in seconds (large = none)
uniform float uIntro;          // 0 → 1 on load
uniform float uLight;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return v;
}
// Rotate so the flow always runs along -y in field space
vec2 orient(vec2 p) {
  if (uDir < 0.5) return p;
  if (uDir < 1.5) return vec2(p.x, -p.y);
  if (uDir < 2.5) return vec2(p.y, p.x);
  return vec2(p.y, -p.x);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  // Pointer: push the field away within the radius
  vec2 dm = p - uMouse.xy;
  float fall = exp(-dot(dm, dm) / (uMouseRadius * uMouseRadius));
  p += normalize(dm + 1e-4) * fall * uMouseStrength * 0.12 * uMouse.z;

  // Click: a swirl that unwinds over a couple of seconds
  vec2 dc = p - uSwirl.xy;
  float sw = exp(-dot(dc, dc) / (uMouseRadius * uMouseRadius * 1.6)) * exp(-uSwirl.z * 1.4) * 4.0;
  float s = sin(sw), c = cos(sw);
  p = uSwirl.xy + mat2(c, -s, s, c) * dc;

  vec2 q = orient(p) * (2.2 / uScale);
  float t = uTime;
  // Domain warp drifting with the flow; fluidity is how quickly the warp itself evolves
  float turb = uTurb * (1.0 + (1.0 - uIntro) * 1.5);
  vec2 w = vec2(fbm(q * 0.7 + vec2(0.0, t) + t * uFluid), fbm(q * 0.7 + vec2(5.2, t + 1.3) - t * uFluid));
  float f = q.x * 3.2 + (w.x - 0.5) * 3.0 * turb + (fbm(q * 1.4 + w * 1.5 + vec2(0.0, t)) - 0.5) * 1.6 * turb;

  // Distance to the nearest line in pixels
  float d = abs(fract(f + 0.5) - 0.5);
  float pd = d / max(fwidth(f), 1e-4);
  float core = pow(1.0 - smoothstep(0.0, uLineWidth, pd), max(uSharp * 0.4, 0.1));
  float rim = smoothstep(uLineWidth, uLineWidth + uRim * 10.0, pd) * (1.0 - smoothstep(uLineWidth + uRim * 10.0, uLineWidth + uRim * 22.0, pd));
  float glow = exp(-pd / max(uGlow * 4.0, 0.01)) * 0.35;
  float shimmer = mix(1.0, 0.55 + 0.45 * sin(f * 1.7 + q.y * 5.0 + t * 3.0), clamp(uShimmer * 0.35, 0.0, 1.0));
  float a = (core + rim * 0.35 + glow) * shimmer;

  // Intro: lines draw in along the flow direction
  float along = 1.0 - orient(uv - 0.5).y - 0.5;
  a *= 1.0 - smoothstep(uIntro * 1.3 - 0.3, uIntro * 1.3, along);
  // Soft edges keep the frame calm
  a *= smoothstep(0.0, 0.18, uv.x) * smoothstep(1.0, 0.82, uv.x) * smoothstep(0.0, 0.12, uv.y) * smoothstep(1.0, 0.88, uv.y) * 0.85;

  vec3 col = uv.x < 0.5 ? mix(uC0, uC1, uv.x * 2.0) : mix(uC1, uC2, uv.x * 2.0 - 1.0);
  a = clamp(a, 0.0, 1.0) * (uLight > 0.5 ? 0.6 : 1.0);
  outColor = vec4(col * a, a);
}`

const DIRS = { down: 0, up: 1, left: 2, right: 3 } as const

/** Resolves any CSS colour, including `var(--token)`, to 0–1 RGB. */
function resolveColor(color: string, host: HTMLElement): [number, number, number] {
  const probe = document.createElement('span')
  probe.style.color = color
  host.appendChild(probe)
  const m = getComputedStyle(probe).color.match(/[\d.]+/g) ?? ['255', '255', '255']
  probe.remove()
  return [Number(m[0]) / 255, Number(m[1]) / 255, Number(m[2]) / 255]
}

export type FluxLinesProps = {
  /** Three colours, left → centre → right. Any CSS colour, including `var(--token)`. */
  colors?: [string, string, string]
  glow?: number
  rimWidth?: number
  /** Line core width in CSS px. */
  lineWidth?: number
  flowDirection?: keyof typeof DIRS
  mouseInteraction?: boolean
  clickSwirl?: boolean
  speed?: number
  scale?: number
  turbulence?: number
  fluidity?: number
  sharpness?: number
  shimmer?: number
  mouseStrength?: number
  mouseRadius?: number
  /** Lines draw in along the flow on load. */
  intro?: boolean
  lightMode?: boolean
  /** Draw a single settled frame and ignore the pointer (reduced motion). */
  still?: boolean
  className?: string
}

export function FluxLines({
  colors = ['var(--ldg-fg-inverse)', 'var(--ldg-fg-inverse)', 'var(--ldg-fg-inverse)'],
  glow = 2,
  rimWidth = 0.2,
  lineWidth = 1,
  flowDirection = 'down',
  mouseInteraction = false,
  clickSwirl = false,
  speed = 0.5,
  scale = 1.6,
  turbulence = 1,
  fluidity = 0.1,
  sharpness = 2.5,
  shimmer = 1.5,
  mouseStrength = 1,
  mouseRadius = 0.35,
  intro = false,
  lightMode = false,
  still = false,
  className,
}: FluxLinesProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [c0, c1, c2] = colors

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
    gl.uniform3fv(u('uC0'), resolveColor(c0, host))
    gl.uniform3fv(u('uC1'), resolveColor(c1, host))
    gl.uniform3fv(u('uC2'), resolveColor(c2, host))
    gl.uniform1f(u('uGlow'), glow)
    gl.uniform1f(u('uRim'), rimWidth)
    gl.uniform1f(u('uScale'), scale)
    gl.uniform1f(u('uTurb'), turbulence)
    gl.uniform1f(u('uFluid'), fluidity)
    gl.uniform1f(u('uSharp'), sharpness)
    gl.uniform1f(u('uShimmer'), shimmer)
    gl.uniform1f(u('uDir'), DIRS[flowDirection])
    gl.uniform1f(u('uMouseStrength'), mouseStrength)
    gl.uniform1f(u('uMouseRadius'), mouseRadius)
    gl.uniform1f(u('uLight'), lightMode ? 1 : 0)

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    gl.uniform1f(u('uLineWidth'), lineWidth * dpr)
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

    // Pointer state in field space: x scaled by aspect, centred, y up. Eased so the bend trails the cursor.
    const target = { x: 0, y: 0, on: 0 }
    const mouse = { x: 0, y: 0, on: 0 }
    let swirl = { x: 0, y: 0, at: -1e6 }
    const toField = (e: PointerEvent | MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
      return { x: ((e.clientX - r.left) / r.width - 0.5) * (r.width / r.height), y: 0.5 - (e.clientY - r.top) / r.height, inside }
    }
    const onMove = (e: PointerEvent) => {
      const f = toField(e)
      target.x = f.x
      target.y = f.y
      target.on = f.inside ? 1 : 0
      wake()
    }
    const onClick = (e: MouseEvent) => {
      const f = toField(e)
      if (!f.inside) return
      swirl = { x: f.x, y: f.y, at: performance.now() }
      wake()
    }
    const interactive = mouseInteraction && !still
    if (interactive) window.addEventListener('pointermove', onMove, { passive: true })
    if (clickSwirl && !still) window.addEventListener('click', onClick)

    const INTRO_MS = 2400
    const born = performance.now()
    const introAt = (now: number) => (!intro || still ? 1 : 1 - (1 - Math.min(1, (now - born) / INTRO_MS)) ** 3)

    const draw = (now: number) => {
      resize()
      mouse.x += (target.x - mouse.x) * 0.08
      mouse.y += (target.y - mouse.y) * 0.08
      mouse.on += (target.on - mouse.on) * 0.06
      gl.uniform1f(u('uTime'), (still ? 40 : now / 1000) * speed)
      gl.uniform3f(u('uMouse'), mouse.x, mouse.y, interactive ? mouse.on : 0)
      gl.uniform3f(u('uSwirl'), swirl.x, swirl.y, (now - swirl.at) / 1000)
      gl.uniform1f(u('uIntro'), introAt(now))
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    let frame = 0
    let visible = false
    const loop = (now: number) => {
      draw(now)
      frame = visible && !still ? requestAnimationFrame(loop) : 0
    }
    function wake() {
      if (visible && !still && !frame) frame = requestAnimationFrame(loop)
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      wake()
    })
    io.observe(canvas)
    draw(performance.now())
    const ro = new ResizeObserver(() => still && draw(performance.now()))
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(frame)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('click', onClick)
      // Free resources but keep the context: a lost context can't be reacquired on remount
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
    }
  }, [c0, c1, c2, glow, rimWidth, lineWidth, flowDirection, mouseInteraction, clickSwirl, speed, scale, turbulence, fluidity, sharpness, shimmer, mouseStrength, mouseRadius, intro, lightMode, still])

  return <canvas ref={ref} aria-hidden className={cx('block size-full', className)} />
}
