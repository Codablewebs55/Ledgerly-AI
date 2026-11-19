import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { useOsReducedMotion } from './motion'

// Ledger lines that ink themselves in as the page scrolls. One line leaves the hero, branches, and the strands weave
// down the side gutters: at each section break one or more swap sides (two swapping at once cross in an X), and two
// strands sharing a gutter run side by side like a ledger's double rule. They finally converge and plug into the
// closing card. Scroll position drives the pen: every strand's tip sits at the same height in the viewport, so
// scrolling back up retracts each line along exactly the path it drew. A faint pencilled guide shows the route ahead.
//
// The strands sit above every section background but under all content (LandingPage lifts each section's content
// to z-10), and recolour per band: forest on the sand sections, lime on the forest ones, blended across each break.

type Side = -1 | 1
type Pt = { x: number; y: number }
type Seg = { to: Pt; c1?: Pt; c2?: Pt }

type Strand = {
  d: string
  total: number
  /** Samples along the path: cumulative length, x and y. y never decreases, so length can be looked up by height. */
  ls: Float32Array
  xs: Float32Array
  ys: Float32Array
  /** Where the strand branches off its parent, if it does */
  branch?: Pt
  end: Pt
}

type Stop = { offset: number; inverse: boolean }
type Geometry = { w: number; h: number; strands: Strand[]; stops: Stop[]; stroke: number }

// Gutter each strand runs in, per section (hero first, the closing card's section excluded). null = not started yet.
// Read down a column to see a section break: A and B swap at the 2nd break (an X), C splits off B at the 4th, and so on.
const ROUTES: { from: number; parent?: number; tracks: number; sides: (Side | null)[] }[] = [
  { from: 0, tracks: -1, sides: [-1, -1, 1, 1, -1, -1, 1, 1, -1] }, // A: the trunk, from the top of the hero
  { from: 1, parent: 0, tracks: 0, sides: [null, 1, -1, -1, -1, 1, 1, -1, 1] }, // B: branches off A as the hero ends
  { from: 3, parent: 1, tracks: 1, sides: [null, null, null, 1, 1, -1, -1, 1, 1] }, // C: branches off B at the AI section (wide screens)
]

/** Where the pen sits in the viewport: tips trail just past the middle of the screen */
const PEN = 0.58

export function LedgerTrail({ pageRef }: { pageRef: RefObject<HTMLDivElement | null> }) {
  const osReduced = useOsReducedMotion()
  const [geo, setGeo] = useState<Geometry | null>(null)
  const lines = useRef<(SVGPathElement | null)[]>([])
  const heads = useRef<(SVGGElement | null)[]>([])
  const nodes = useRef<(SVGCircleElement | null)[]>([])
  // Where the pen is, kept across re-layouts so the drawing never restarts. It starts at the top so the first stretch
  // inks itself in on load.
  const pen = useRef(0)

  // Measure the page and lay out the strands; again whenever the page changes size (fonts, images, viewport)
  useLayoutEffect(() => {
    const page = pageRef.current
    if (!page) return
    let raf = 0
    const build = () => {
      raf = 0
      setGeo(measure(page))
    }
    build()
    const ro = new ResizeObserver(() => {
      if (!raf) raf = requestAnimationFrame(build)
    })
    ro.observe(page)
    return () => {
      ro.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [pageRef])

  // Drive the pen from the scroll position
  useEffect(() => {
    const page = pageRef.current
    if (!geo || !page) return

    const draw = (penY: number) => {
      geo.strands.forEach((s, i) => {
        const len = lengthAtY(s, penY)
        const line = lines.current[i]
        if (line) line.style.strokeDashoffset = String(s.total - len)
        const head = heads.current[i]
        if (head) {
          const live = len > 0 && len < s.total
          head.style.opacity = live ? '1' : '0'
          if (live) {
            const p = pointAt(s, len)
            head.setAttribute('transform', `translate(${p.x} ${p.y})`)
          }
        }
        const start = nodes.current[i * 2]
        if (start) start.style.opacity = len > 0 ? '1' : '0'
        const end = nodes.current[i * 2 + 1]
        if (end) end.style.opacity = len >= s.total - 0.5 ? '1' : '0'
      })
    }

    // Still: the finished drawing. Also on boards taller than any screen (full-page canvas captures), which never scroll.
    if (osReduced || innerHeight > 2000) {
      draw(Infinity)
      return
    }

    const pageTop = () => page.getBoundingClientRect().top + scrollY
    const target = () => scrollY + innerHeight * PEN - pageTop()
    // The pen glides after the scroll a little, so a flick of the wheel still draws in one smooth stroke
    let last = 0
    let raf = 0
    const tick = (now: number) => {
      const goal = target()
      const dt = last ? Math.min(now - last, 64) : 16.7
      last = now
      pen.current += (goal - pen.current) * (1 - Math.pow(1 - 0.14, dt / 16.7))
      if (Math.abs(goal - pen.current) < 0.5) pen.current = goal
      draw(pen.current)
      raf = pen.current === goal ? 0 : requestAnimationFrame(tick)
      if (!raf) last = 0
    }
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    draw(pen.current)
    wake()
    addEventListener('scroll', wake, { passive: true })
    addEventListener('resize', wake)
    return () => {
      removeEventListener('scroll', wake)
      removeEventListener('resize', wake)
      cancelAnimationFrame(raf)
    }
  }, [geo, osReduced, pageRef])

  if (!geo) return null
  const ink = 'url(#ledger-trail-ink)'

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <svg width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} fill="none" className="block">
        <defs>
          <linearGradient id="ledger-trail-ink" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={geo.h}>
            {geo.stops.map((s, i) => (
              <stop
                key={i}
                offset={s.offset}
                stopColor="currentColor"
                stopOpacity={s.inverse ? 0.7 : 0.45}
                className={s.inverse ? 'text-line-inverse-accent' : 'text-line-brand'}
              />
            ))}
          </linearGradient>
        </defs>

        {/* The pencilled route ahead */}
        <g opacity={0.3} stroke={ink} strokeWidth={1} strokeDasharray="1 7" strokeLinecap="round">
          {geo.strands.map((s, i) => (
            <path key={i} d={s.d} />
          ))}
        </g>

        {/* The inked lines */}
        <g stroke={ink} strokeWidth={geo.stroke} strokeLinecap="round" strokeLinejoin="round">
          {geo.strands.map((s, i) => (
            <path
              key={i}
              ref={(el) => {
                lines.current[i] = el
              }}
              d={s.d}
              pathLength={s.total}
              strokeDasharray={s.total}
              strokeDashoffset={s.total}
            />
          ))}
        </g>

        {/* Joints: where a strand branches off, and where it plugs into the closing card */}
        <g fill={ink}>
          {geo.strands.flatMap((s, i) => [
            <Node key={`b${i}`} at={s.branch} r={geo.stroke + 2} innerRef={(el) => (nodes.current[i * 2] = el)} />,
            <Node key={`e${i}`} at={s.end} r={geo.stroke + 2} innerRef={(el) => (nodes.current[i * 2 + 1] = el)} />,
          ])}
        </g>

        {/* The pen: a nib with a soft halo at the tip of each strand */}
        <g fill={ink}>
          {geo.strands.map((_, i) => (
            <g
              key={i}
              ref={(el) => {
                heads.current[i] = el
              }}
              className="opacity-0 transition-opacity duration-(--duration-base)"
            >
              <circle r={geo.stroke * 6} opacity={0.18} />
              <circle r={geo.stroke + 1.5} />
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}

function Node({ at, r, innerRef }: { at?: Pt; r: number; innerRef: (el: SVGCircleElement | null) => void }) {
  if (!at) return null
  return <circle ref={innerRef} cx={at.x} cy={at.y} r={r} className="opacity-0 transition-opacity duration-(--duration-slow)" />
}

// ---------------------------------------------------------------------------------------------------------------------
// Layout

function measure(page: HTMLElement): Geometry | null {
  const sections = Array.from(page.querySelectorAll<HTMLElement>(':scope > main > section'))
  if (sections.length < 3) return null
  const origin = page.getBoundingClientRect()
  const rel = (el: Element) => {
    const r = el.getBoundingClientRect()
    return { top: r.top - origin.top, bottom: r.bottom - origin.top, left: r.left - origin.left, right: r.right - origin.left }
  }

  const w = page.clientWidth
  const h = page.scrollHeight
  const wide = w >= 768

  // The side gutters: from the page edge to where section content starts
  const body = sections[1].firstElementChild as HTMLElement
  const gutter = rel(body).left + parseFloat(getComputedStyle(body).paddingLeft)
  const lane = (side: Side, track: number) => (side < 0 ? gutter / 2 : w - gutter / 2) + track * Math.min(12, gutter * 0.18)

  // The empty band at each section break, between one section's content and the next one's. Strands change gutters
  // only inside these bands, so the sideways runs cross open space.
  const last = sections.length - 1
  const bands = sections.map((s, k) => {
    if (k === 0) return { top: 0, bottom: 0 }
    const above = rel(sections[k - 1].firstElementChild ?? sections[k - 1]).bottom
    const below = rel(s.firstElementChild ?? s).top
    const mid = (above + below) / 2
    const half = Math.max((below - above) / 2, 44)
    return { top: mid - half * 0.85, bottom: mid + half * 0.85 }
  })

  const card = rel(sections[last].firstElementChild ?? sections[last])
  const navHeight = page.querySelector('header')?.getBoundingClientRect().height ?? 64
  const routes = ROUTES.slice(0, wide ? 3 : 2)

  // Lay each strand out section by section; a branch starts on its parent strand
  const strands: Strand[] = routes.map((route) => {
    const sideAt = (k: number) => route.sides[Math.min(k, route.sides.length - 1)] as Side
    const x = (k: number) => lane(sideAt(k), route.tracks)
    let start: Pt
    let branch: Pt | undefined
    const segs: Seg[] = []
    if (route.from === 0) {
      start = { x: x(0), y: navHeight }
    } else {
      // Peel off the strand this one shares a gutter with, at the top of the break
      const b = bands[route.from]
      const from = routes[route.parent ?? 0]
      const px = lane(from.sides[route.from - 1] as Side, from.tracks)
      start = branch = { x: px, y: b.top }
      segs.push(swerve(start, { x: x(route.from), y: b.bottom }))
    }
    let at = segs.length ? segs[segs.length - 1].to : start
    for (let k = route.from + 1; k < last; k++) {
      const nx = x(k)
      if (nx === at.x) continue
      const b = bands[k]
      segs.push({ to: { x: at.x, y: b.top } })
      at = { x: nx, y: b.bottom }
      segs.push(swerve(segs[segs.length - 1].to, at))
    }
    // Converge on the closing card: in from its nearer side, plugging into the top edge
    const side = sideAt(last - 1)
    const inset = 32 + (route.tracks + 1) * Math.min(14, card.right - card.left > 600 ? 14 : 8)
    const end = { x: side < 0 ? card.left + inset : card.right - inset, y: card.top }
    const b = bands[last]
    segs.push({ to: { x: at.x, y: b.top } })
    segs.push(swerve({ x: at.x, y: b.top }, end))
    segs.push({ to: { x: end.x, y: end.y + 40 } }) // on behind the card
    return { ...sample(start, segs), branch, end }
  })

  // Ink colour per band: lime on forest sections, forest on sand, blended across each break
  const stops: Stop[] = []
  const blend = 56
  sections.slice(0, last).forEach((s, k) => {
    const r = rel(s)
    const inverse = s.classList.contains('bg-inverse')
    stops.push({ offset: clamp01((r.top + (k ? blend : 0)) / h), inverse })
    stops.push({ offset: clamp01((r.bottom - blend) / h), inverse })
  })
  stops.push({ offset: 1, inverse: false })

  return { w, h, strands, stops, stroke: wide ? 1.5 : 1.25 }
}

/** An S-bend from one point down to another: leaves straight down, arrives straight down */
function swerve(from: Pt, to: Pt): Seg {
  const mid = (from.y + to.y) / 2
  return { c1: { x: from.x, y: mid }, c2: { x: to.x, y: mid }, to }
}

// ---------------------------------------------------------------------------------------------------------------------
// Geometry helpers

function sample(start: Pt, segs: Seg[]): Omit<Strand, 'branch' | 'end'> {
  const ls: number[] = [0]
  const xs: number[] = [start.x]
  const ys: number[] = [start.y]
  let d = `M${f(start.x)} ${f(start.y)}`
  let p = start
  for (const s of segs) {
    if (s.c1 && s.c2) {
      d += `C${f(s.c1.x)} ${f(s.c1.y)} ${f(s.c2.x)} ${f(s.c2.y)} ${f(s.to.x)} ${f(s.to.y)}`
      const n = 32
      for (let j = 1; j <= n; j++) push(cubic(p, s.c1, s.c2, s.to, j / n))
    } else {
      d += `L${f(s.to.x)} ${f(s.to.y)}`
      push(s.to)
    }
    p = s.to
  }
  function push(q: Pt) {
    const i = xs.length - 1
    ls.push(ls[i] + Math.hypot(q.x - xs[i], q.y - ys[i]))
    xs.push(q.x)
    ys.push(Math.max(q.y, ys[i]))
  }
  return { d, total: ls[ls.length - 1], ls: new Float32Array(ls), xs: new Float32Array(xs), ys: new Float32Array(ys) }
}

function cubic(a: Pt, b: Pt, c: Pt, d: Pt, t: number): Pt {
  const u = 1 - t
  return {
    x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
    y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y,
  }
}

/** How much of the strand is drawn when the pen is at height y */
function lengthAtY(s: Strand, y: number) {
  const { ys, ls } = s
  const n = ys.length
  if (y <= ys[0]) return 0
  if (y >= ys[n - 1]) return s.total
  let lo = 0
  let hi = n - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (ys[mid] < y) lo = mid
    else hi = mid
  }
  const span = ys[hi] - ys[lo]
  return span > 0 ? ls[lo] + ((y - ys[lo]) / span) * (ls[hi] - ls[lo]) : ls[hi]
}

function pointAt(s: Strand, len: number): Pt {
  const { ls, xs, ys } = s
  let lo = 0
  let hi = ls.length - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (ls[mid] < len) lo = mid
    else hi = mid
  }
  const t = ls[hi] > ls[lo] ? (len - ls[lo]) / (ls[hi] - ls[lo]) : 0
  return { x: xs[lo] + (xs[hi] - xs[lo]) * t, y: ys[lo] + (ys[hi] - ys[lo]) * t }
}

const f = (n: number) => n.toFixed(1)
const clamp01 = (n: number) => Math.min(1, Math.max(0, n))
