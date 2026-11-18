import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { cx } from '@/ds/utils/cx'

// A slow, glittering field: a faint drifting glow with flecks that twinkle on their own clocks, and a soft band of
// light that sweeps across every few seconds and makes the flecks it passes flare. WebGL2 draws it (one full-screen
// fragment shader); GSAP owns the clock, the sweep and the breathing, and renders on its ticker.
// Pauses off screen; draws one still frame under reduced motion.

const VERT = `#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2 uRes;
uniform float uTime;
uniform float uSweep;      // sweep band position, -0.3..1.3 across the diagonal
uniform float uBreath;     // 0..1, slow overall swell
uniform float uDensity;    // glitter cell size in CSS px
uniform float uDpr;
uniform vec3 uGlitter, uHot, uGlow;
uniform float uIntro;      // 0 → 1 on load

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec2 hash2(vec2 p) { return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

// One layer of glitter: a jittered fleck per cell, each twinkling at its own rate and phase
vec3 glitter(vec2 px, float cell, float t, float seed, float sweepBoost) {
  vec2 g = px / cell;
  vec2 id = floor(g);
  vec2 r = hash2(id + seed);
  if (r.x > 0.55) return vec3(0.0);                      // most cells stay empty
  vec2 c = id + 0.2 + 0.6 * hash2(id + seed + 7.0);
  vec2 d = (g - c) * cell / uDpr;                        // CSS px from the fleck
  float rate = 0.6 + 1.8 * r.y;
  float tw = pow(0.5 + 0.5 * sin(t * rate + r.x * 40.0), 6.0);
  float size = 0.6 + 1.2 * hash(id + seed + 3.0);
  float core = exp(-dot(d, d) / (size * size));
  // Four-point star arms on the brightest flecks
  float arms = (exp(-abs(d.x) * 2.2) * exp(-abs(d.y) * 0.35) + exp(-abs(d.y) * 2.2) * exp(-abs(d.x) * 0.35)) * 0.35;
  float lit = tw * (0.35 + 0.65 * uBreath) + sweepBoost * 1.4;
  float a = (core + arms * smoothstep(0.55, 1.0, lit)) * lit;
  vec3 col = mix(uGlitter, uHot, smoothstep(0.6, 1.2, lit));
  return col * a;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 px = gl_FragCoord.xy;
  float t = uTime;

  // Faint drifting glow underneath
  float n = noise(uv * vec2(2.2, 1.6) + vec2(t * 0.03, -t * 0.02)) * 0.6 + noise(uv * 4.0 - t * 0.04) * 0.4;
  vec3 col = uGlow * smoothstep(0.35, 0.95, n) * (0.35 + 0.25 * uBreath);

  // Diagonal light band that sweeps across
  float diag = (uv.x * 0.8 + (1.0 - uv.y) * 0.2);
  float band = exp(-pow((diag - uSweep) * 5.5, 2.0));
  col += uGlow * band * 0.35;

  float cell = uDensity * uDpr;
  col += glitter(px, cell, t, 0.0, band);
  col += glitter(px + cell * 0.5, cell * 1.7, t * 0.8, 19.0, band) * 0.8;

  // Soft vignette keeps the edges calm
  float edge = smoothstep(0.0, 0.12, uv.x) * smoothstep(1.0, 0.88, uv.x) * smoothstep(0.0, 0.15, uv.y) * smoothstep(1.0, 0.9, uv.y);
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

export type GlitterFieldProps = {
  /** Fleck colour. Any CSS colour, including `var(--token)`. */
  color?: string
  /** Colour flecks flare to at their brightest. */
  hotColor?: string
  /** The faint drifting glow and sweep band. */
  glowColor?: string
  /** Glitter cell size in CSS px: smaller is denser. */
  density?: number
  /** Seconds for the light band to cross the field. */
  sweepDuration?: number
  /** Draw a single settled frame (reduced motion). */
  still?: boolean
  className?: string
}

export function GlitterField({
  color = 'var(--ldg-fg-inverse-accent)',
  hotColor = 'var(--ldg-fg-inverse)',
  glowColor = 'var(--ldg-bg-brand)',
  density = 26,
  sweepDuration = 5,
  still = false,
  className,
}: GlitterFieldProps) {
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
    gl.uniform3fv(u('uGlitter'), resolveColor(color, host))
    gl.uniform3fv(u('uHot'), resolveColor(hotColor, host))
    gl.uniform3fv(u('uGlow'), resolveColor(glowColor, host))
    gl.uniform1f(u('uDensity'), density)

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    gl.uniform1f(u('uDpr'), dpr)
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

    // State GSAP tweens; the shader reads it every frame
    const s = { t: 20, sweep: 0.45, breath: 0.6, intro: still ? 1 : 0 }
    const draw = () => {
      resize()
      gl.uniform1f(u('uTime'), s.t)
      gl.uniform1f(u('uSweep'), s.sweep)
      gl.uniform1f(u('uBreath'), s.breath)
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

    const ctx = gsap.context(() => {
      gsap.to(s, { intro: 1, duration: 1.8, ease: 'power2.out' })
      gsap.to(s, { t: '+=1000', duration: 1000, ease: 'none', repeat: -1 })
      gsap.fromTo(s, { sweep: -0.3 }, { sweep: 1.3, duration: sweepDuration, ease: 'sine.inOut', repeat: -1, repeatDelay: 1.6 })
      gsap.fromTo(s, { breath: 0.35 }, { breath: 1, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    })

    // GSAP's ticker renders; everything pauses while the field is off screen
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
  }, [color, hotColor, glowColor, density, sweepDuration, still])

  return <canvas ref={ref} aria-hidden className={cx('block size-full', className)} />
}
