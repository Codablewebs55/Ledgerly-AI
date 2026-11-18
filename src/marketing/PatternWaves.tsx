import { useEffect, useRef } from 'react'
import { cx } from '@/ds/utils/cx'

// A halftone field of marks riding slow "silk" waves: each grid cell's mark grows and brightens with the
// height of the wave under it, and the cursor lifts a soft dome in the field. Plain WebGL2 (one full-screen
// fragment shader), no library. Pauses off screen; draws one still frame under reduced motion.

const VERT = `#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2 uRes;
uniform float uTime;
uniform vec3 uColor;
uniform vec4 uBg;              // rgb + alpha (alpha 0 = transparent, let the host show through)
uniform float uSpacing;        // device px between marks
uniform float uMark, uDepth, uLight, uShine, uContrast, uScale, uOpacity;
uniform float uDir;            // wave travel direction, radians
uniform float uSquare;         // 0 dot, 1 square
uniform vec3 uCursor;          // xy device px, z = presence 0..1
uniform float uCursorSize, uCursorStrength;
uniform float uFade;           // 0 none, 1 edges, 2 vignette
uniform float uFadeSize;
uniform float uIntro;

// Layered, domain-warped sines read as folds of silk rather than ripples
float silk(vec2 p, float t) {
  float c = cos(uDir), s = sin(uDir);
  p = mat2(c, -s, s, c) * p;
  p.x += 0.35 * sin(p.y * 1.3 + t * 0.7);
  p.y += 0.25 * sin(p.x * 0.9 - t * 0.5);
  float h = sin(p.x * 1.6 + t) * 0.5
          + sin(p.x * 0.7 - p.y * 1.1 + t * 0.6) * 0.3
          + sin(p.y * 2.3 + p.x * 0.4 - t * 0.8) * 0.2;
  return h * 0.5 + 0.5;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 cell = floor(frag / uSpacing);
  vec2 centre = (cell + 0.5) * uSpacing;
  vec2 local = frag - centre;

  // Wave height sampled once per cell so every mark is a clean shape
  vec2 field = (centre - 0.5 * uRes) / uRes.y * (3.0 / uScale);
  float h = silk(field, uTime);

  // Cursor: a soft dome that lifts the marks under it
  float d = length(centre - uCursor.xy);
  float dome = exp(-(d * d) / (uCursorSize * uCursorSize)) * uCursor.z * uCursorStrength;
  h = clamp(h + dome * 0.6, 0.0, 1.0);

  h = pow(h, uContrast);
  float size = uMark * 0.5 * uSpacing * mix(1.0 - uDepth, 1.0, h);
  float dist = uSquare > 0.5 ? max(abs(local.x), abs(local.y)) : length(local);
  float mark = 1.0 - smoothstep(size - 0.75, size + 0.75, dist);

  // Shine catches the crests; light lifts the troughs
  float bright = mix(0.25 + 0.75 * h, 1.0, uLight) + uShine * pow(h, 6.0) * 0.6;
  float a = mark * clamp(bright, 0.0, 1.0) * uOpacity * uIntro;

  vec2 uv = frag / uRes;
  if (uFade > 0.5 && uFade < 1.5) {
    float f = max(uFadeSize, 0.001) * 0.5;
    a *= smoothstep(0.0, f, uv.x) * smoothstep(1.0, 1.0 - f, uv.x) * smoothstep(0.0, f, uv.y) * smoothstep(1.0, 1.0 - f, uv.y);
  } else if (uFade > 1.5) {
    a *= 1.0 - smoothstep(0.5 - uFadeSize * 0.5, 0.75, length(uv - 0.5));
  }

  // Premultiplied: marks over the (optional) background
  vec3 col = uColor * a + uBg.rgb * uBg.a * (1.0 - a);
  outColor = vec4(col, a + uBg.a * (1.0 - a));
}`

const FADES = { none: 0, edges: 1, vignette: 2 } as const

/** Resolves any CSS colour, including `var(--token)`, to 0–1 RGBA. */
function resolveColor(color: string, host: HTMLElement): [number, number, number, number] {
  const probe = document.createElement('span')
  probe.style.color = color
  host.appendChild(probe)
  const m = getComputedStyle(probe).color.match(/[\d.]+/g) ?? ['0', '0', '0', '0']
  probe.remove()
  return [Number(m[0]) / 255, Number(m[1]) / 255, Number(m[2]) / 255, m[3] === undefined ? 1 : Number(m[3])]
}

export type PatternWavesProps = {
  /** Mark colour. Any CSS colour, including `var(--token)`. */
  color?: string
  /** Fill behind the marks. Leave `transparent` to blend onto whatever the host paints. */
  backgroundColor?: string
  fade?: keyof typeof FADES
  /** 0–1: how far in from the edges the fade reaches. */
  fadeSize?: number
  interactive?: boolean
  /** Cursor dome radius in CSS px. */
  cursorSize?: number
  cursorStrength?: number
  /** How quickly the dome follows the cursor, 0–1 per frame. Low keeps hover as calm as the waves. */
  cursorEase?: number
  pattern?: 'dot' | 'square'
  /** Grid pitch in CSS px. */
  spacing?: number
  /** Largest mark as a fraction of the pitch. */
  markSize?: number
  /** 0–1: how much troughs shrink the marks. */
  depth?: number
  light?: number
  shine?: number
  contrast?: number
  speed?: number
  scale?: number
  /** Wave travel direction in degrees. */
  direction?: number
  opacity?: number
  /** Marks fade in on load. */
  intro?: boolean
  paused?: boolean
  /** Draw a single settled frame and ignore the pointer (reduced motion). */
  still?: boolean
  className?: string
}

export function PatternWaves({
  color = 'var(--ldg-fg-inverse)',
  backgroundColor = 'transparent',
  fade = 'edges',
  fadeSize = 0.5,
  interactive = false,
  cursorSize = 50,
  cursorStrength = 0.6,
  cursorEase = 0.03,
  pattern = 'dot',
  spacing = 9,
  markSize = 0.95,
  depth = 0.95,
  light = 0,
  shine = 0.8,
  contrast = 1.2,
  speed = 0.35,
  scale = 1,
  direction = 20,
  opacity = 1,
  intro = false,
  paused = false,
  still = false,
  className,
}: PatternWavesProps) {
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
    gl.uniform3fv(u('uColor'), resolveColor(color, host).slice(0, 3))
    gl.uniform4fv(u('uBg'), resolveColor(backgroundColor, host))
    gl.uniform1f(u('uMark'), markSize)
    gl.uniform1f(u('uDepth'), depth)
    gl.uniform1f(u('uLight'), light)
    gl.uniform1f(u('uShine'), shine)
    gl.uniform1f(u('uContrast'), contrast)
    gl.uniform1f(u('uScale'), scale)
    gl.uniform1f(u('uOpacity'), opacity)
    gl.uniform1f(u('uDir'), (direction * Math.PI) / 180)
    gl.uniform1f(u('uSquare'), pattern === 'square' ? 1 : 0)
    gl.uniform1f(u('uCursorStrength'), cursorStrength)
    gl.uniform1f(u('uFade'), FADES[fade])
    gl.uniform1f(u('uFadeSize'), fadeSize)

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    gl.uniform1f(u('uSpacing'), spacing * dpr)
    gl.uniform1f(u('uCursorSize'), cursorSize * dpr)
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

    // Pointer in device px, y up. Eased slowly so hovering never speeds the field up.
    const target = { x: 0, y: 0, on: 0 }
    const cursor = { x: 0, y: 0, on: 0 }
    const live = interactive && !still
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
      target.x = (e.clientX - r.left) * dpr
      target.y = (r.bottom - e.clientY) * dpr
      if (inside && !cursor.on) {
        cursor.x = target.x
        cursor.y = target.y
      }
      target.on = inside ? 1 : 0
      wake()
    }
    if (live) window.addEventListener('pointermove', onMove, { passive: true })

    const INTRO_MS = 1800
    const born = performance.now()
    const introAt = (now: number) => (!intro || still ? 1 : 1 - (1 - Math.min(1, (now - born) / INTRO_MS)) ** 3)

    // Time only advances while animating, so pausing or scrolling away resumes where it left off
    let t = 40
    let last = performance.now()
    const draw = (now: number) => {
      resize()
      if (!still && !paused) t += ((now - last) / 1000) * speed
      last = now
      cursor.x += (target.x - cursor.x) * cursorEase
      cursor.y += (target.y - cursor.y) * cursorEase
      cursor.on += (target.on - cursor.on) * cursorEase
      gl.uniform1f(u('uTime'), t)
      gl.uniform3f(u('uCursor'), cursor.x, cursor.y, live ? cursor.on : 0)
      gl.uniform1f(u('uIntro'), introAt(now))
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    let frame = 0
    let visible = false
    const animating = () => visible && !still && (!paused || live)
    const loop = (now: number) => {
      draw(now)
      frame = animating() ? requestAnimationFrame(loop) : 0
    }
    function wake() {
      if (animating() && !frame) {
        last = performance.now()
        frame = requestAnimationFrame(loop)
      }
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      wake()
    })
    io.observe(canvas)
    draw(performance.now())
    const ro = new ResizeObserver(() => !frame && draw(performance.now()))
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(frame)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      // Free resources but keep the context: a lost context can't be reacquired on remount
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
    }
  }, [color, backgroundColor, fade, fadeSize, interactive, cursorSize, cursorStrength, cursorEase, pattern, spacing, markSize, depth, light, shine, contrast, speed, scale, direction, opacity, intro, paused, still])

  return <canvas ref={ref} aria-hidden className={cx('block size-full', className)} />
}
