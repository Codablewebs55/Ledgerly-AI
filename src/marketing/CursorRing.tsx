import { useEffect, useRef } from 'react'
import gsap from 'gsap'

// Custom circular cursor for the marketing page. A small WebGL2 canvas draws a liquid ring that trails the pointer,
// stretches along its velocity and wobbles while it moves; a DOM dot tracks the pointer exactly. GSAP smooths the
// ring's position (quickTo), tweens its size, fill and colour when it hovers anything clickable, and runs the
// render loop on its ticker. Fine pointers only, so touch devices keep their native behaviour.

const SIZE = 160 // css px of the ring canvas; the ring and its stretch stay inside it

const VERT = `#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;

uniform float uDpr;
uniform vec2 uRes;
uniform vec2 uVel;      // smoothed velocity, css px per frame
uniform float uR;       // ring radius, css px
uniform float uFill;    // 0..1 disc fill on hover
uniform float uAlpha;   // overall visibility
uniform float uTime;
uniform vec3 uColor, uHalo;

void main() {
  vec2 p = (gl_FragCoord.xy - uRes * 0.5) / uDpr;
  p.y = -p.y;

  // Stretch along the direction of travel and squash across it
  float speed = length(uVel);
  float s = min(speed * 0.022, 0.55);
  vec2 dir = speed > 0.01 ? uVel / speed : vec2(1.0, 0.0);
  vec2 q = vec2(dot(p, dir) / (1.0 + s), dot(p, vec2(-dir.y, dir.x)) * (1.0 + s * 0.45));

  // Liquid edge: a few slow lobes that grow with speed
  float a = atan(q.y, q.x);
  float wob = (sin(a * 3.0 + uTime * 3.1) + 0.6 * sin(a * 5.0 - uTime * 2.3)) * (0.6 + speed * 0.12);
  float d = length(q) - (uR + wob);

  float stroke = 1.0 - smoothstep(0.75, 1.75, abs(d));             // ~1.5px ring
  float halo = (1.0 - smoothstep(0.5, 2.5, abs(d - 1.6))) * 0.55;   // dark outline so it reads on light sections
  float inside = 1.0 - smoothstep(-1.0, 0.5, d);
  float glow = exp(-max(d, 0.0) / 9.0) * 0.18 * (1.0 - step(d, 0.0));

  vec3 col = uColor * (stroke + glow + inside * uFill * 0.22);
  float alpha = stroke + glow + inside * uFill * 0.22;
  col = mix(col, uHalo, halo * (1.0 - stroke) * (1.0 - uFill * 0.6));
  alpha = max(alpha, halo * (1.0 - stroke) * (1.0 - uFill * 0.6));

  alpha = clamp(alpha * uAlpha, 0.0, 1.0);
  outColor = vec4(clamp(col * uAlpha, 0.0, 1.0), alpha);
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

const INTERACTIVE = 'a, button, summary, label, select, [role="button"], [data-cursor]'
const TEXT_INPUT = 'input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]), textarea, [contenteditable="true"]'

export type CursorRingProps = {
  /** Ring colour at rest. Any CSS colour, including `var(--token)`. */
  color?: string
  /** Ring colour while hovering something clickable. An element's `data-cursor-color` overrides it. */
  hoverColor?: string
  /** Outline drawn around the ring so it stays visible on light sections. */
  haloColor?: string
  /** Ring radius at rest and on hover, css px. */
  radius?: number
  hoverRadius?: number
  /** Seconds the ring takes to catch the pointer. */
  follow?: number
}

export function CursorRing({
  color = 'var(--ldg-bg-accent)',
  hoverColor = 'var(--ldg-fg-inverse)',
  haloColor = 'var(--ldg-bg-inverse)',
  radius = 16,
  hoverRadius = 30,
  follow = 0.45,
}: CursorRingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const dot = dotRef.current
    if (!canvas || !dot || !matchMedia('(pointer: fine)').matches) return
    const gl = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: true, alpha: true })
    if (!gl) return

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
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = canvas.height = Math.round(SIZE * dpr)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform1f(u('uDpr'), dpr)
    gl.uniform2f(u('uRes'), canvas.width, canvas.height)

    const host = canvas.parentElement ?? document.body
    const rest = resolveColor(color, host)
    const hover = resolveColor(hoverColor, host)
    gl.uniform3fv(u('uHalo'), resolveColor(haloColor, host))

    // Hide the system cursor everywhere except text fields, where the I-beam matters
    const style = document.createElement('style')
    style.textContent = `html, html * { cursor: none !important; } ${TEXT_INPUT.split(', ').map((s) => `html ${s}`).join(', ')} { cursor: text !important; }`
    document.head.appendChild(style)

    // State GSAP animates; the shader reads it every frame
    const ring = { x: -100, y: -100, r: radius, fill: 0, alpha: 0, cr: rest[0], cg: rest[1], cb: rest[2] }
    const vel = { x: 0, y: 0 }
    const clock = { t: 0 }
    let last = { x: ring.x, y: ring.y }
    let shown = false

    const ctx = gsap.context(() => {
      const toX = gsap.quickTo(ring, 'x', { duration: follow, ease: 'power3.out' })
      const toY = gsap.quickTo(ring, 'y', { duration: follow, ease: 'power3.out' })
      const dotX = gsap.quickSetter(dot, 'x', 'px')
      const dotY = gsap.quickSetter(dot, 'y', 'px')
      gsap.to(clock, { t: '+=1000', duration: 1000, ease: 'none', repeat: -1 })

      let hovering: Element | null = null
      let overText = false
      const setHover = (el: Element | null) => {
        if (el === hovering) return
        hovering = el
        const custom = el?.getAttribute('data-cursor-color')
        const c = el ? (custom ? resolveColor(custom, host) : hover) : rest
        gsap.to(ring, { r: el ? hoverRadius : radius, fill: el ? 1 : 0, cr: c[0], cg: c[1], cb: c[2], duration: 0.45, ease: 'power3.out', overwrite: 'auto' })
        gsap.to(dot, { scale: el ? 0 : 1, duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
      }

      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return
        if (!shown) {
          shown = true
          overText = false
          ring.x = last.x = e.clientX
          ring.y = last.y = e.clientY
          gsap.to(ring, { alpha: 1, duration: 0.3, overwrite: 'auto' })
          gsap.to(dot, { opacity: 1, duration: 0.3, overwrite: 'auto' })
        }
        toX(e.clientX)
        toY(e.clientY)
        dotX(e.clientX)
        dotY(e.clientY)
        const t = e.target instanceof Element ? e.target : null
        const inText = !!t?.closest(TEXT_INPUT)
        if (inText !== overText) {
          overText = inText
          gsap.to(ring, { alpha: inText ? 0 : 1, duration: 0.2, overwrite: 'auto' })
          gsap.to(dot, { opacity: inText ? 0 : 1, duration: 0.2, overwrite: 'auto' })
        }
        setHover(inText ? null : (t?.closest(INTERACTIVE) ?? null))
      }
      const onLeave = () => {
        shown = false
        gsap.to(ring, { alpha: 0, duration: 0.25, overwrite: 'auto' })
        gsap.to(dot, { opacity: 0, duration: 0.25, overwrite: 'auto' })
      }
      const onDown = () => gsap.to(ring, { r: (hovering ? hoverRadius : radius) * 0.75, duration: 0.15, ease: 'power2.out', overwrite: 'auto' })
      const onUp = () => gsap.to(ring, { r: hovering ? hoverRadius : radius, duration: 0.5, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' })

      addEventListener('pointermove', onMove, { passive: true })
      addEventListener('pointerdown', onDown, { passive: true })
      addEventListener('pointerup', onUp, { passive: true })
      document.documentElement.addEventListener('mouseleave', onLeave)
      return () => {
        removeEventListener('pointermove', onMove)
        removeEventListener('pointerdown', onDown)
        removeEventListener('pointerup', onUp)
        document.documentElement.removeEventListener('mouseleave', onLeave)
      }
    })

    let blank = false
    const draw = () => {
      // Pointer off the page (or over a text field): the ring is invisible, so after one clear frame stop redrawing
      if (ring.alpha < 0.001) {
        if (blank) return
        blank = true
      } else blank = false
      // Velocity of the trailing ring, eased so the stretch settles smoothly
      vel.x += (ring.x - last.x - vel.x) * 0.25
      vel.y += (ring.y - last.y - vel.y) * 0.25
      last = { x: ring.x, y: ring.y }
      canvas.style.transform = `translate3d(${ring.x - SIZE / 2}px, ${ring.y - SIZE / 2}px, 0)`
      gl.uniform2f(u('uVel'), vel.x, vel.y)
      gl.uniform1f(u('uR'), ring.r)
      gl.uniform1f(u('uFill'), ring.fill)
      gl.uniform1f(u('uAlpha'), ring.alpha)
      gl.uniform1f(u('uTime'), clock.t)
      gl.uniform3f(u('uColor'), ring.cr, ring.cg, ring.cb)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    gsap.ticker.add(draw)

    return () => {
      gsap.ticker.remove(draw)
      ctx.revert()
      style.remove()
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
    }
  }, [color, hoverColor, haloColor, radius, hoverRadius, follow])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      <canvas ref={canvasRef} data-cursor-ring className="absolute top-0 left-0 block" style={{ width: SIZE, height: SIZE, willChange: 'transform' }} />
      <div
        ref={dotRef}
        className="absolute -top-[3px] -left-[3px] size-1.5 rounded-full bg-accent opacity-0 shadow-[0_0_0_1.5px_var(--ldg-bg-inverse)]"
      />
    </div>
  )
}
