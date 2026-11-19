import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { useOsReducedMotion } from './motion'

// A pair of parallel hairlines that ink themselves in as the page scrolls. They drop from the very top of the page,
// behind the header, down the hero's left gutter, turn in a clean rounded corner to the centre of the page, and from
// there step down through the middle: a straight run across each section break, then straight down again. The two
// lines keep an even gap the whole way (their corners are concentric), so they never touch or cross. They end by
// plugging into the closing card.
//
// Scroll position drives the pen. Each horizontal run is drawn while its break passes the pen line, and the drops in
// between are drawn as the section scrolls by, so scrolling back up retracts the lines along exactly the path they
// drew. A brighter comet rides the tip.
//
// The lines sit above every section background but under all content (LandingPage lifts each section's content to
// z-10), and recolour per band: forest on the sand sections, lime on the forest ones, blended across each break.

type Pt = { x: number; y: number }
type Seg = { to: Pt; c1?: Pt; c2?: Pt }

type Strand = { d: string; total: number }
type Key = { pen: number; len: number[] }
type Stop = { offset: number; inverse: boolean }
type Geometry = { w: number; h: number; strands: Strand[]; keys: Key[]; stops: Stop[]; stroke: number }

/** Where the pen sits in the viewport: the tips trail just past the middle of the screen */
const PEN = 0.58
/** Length of the bright comet at each tip */
const COMET = 220
/** Bezier handle length for a quarter circle */
const KAPPA = 0.5523

export function LedgerTrail({ pageRef }: { pageRef: RefObject<HTMLDivElement | null> }) {
  const osReduced = useOsReducedMotion()
  const [geo, setGeo] = useState<Geometry | null>(null)
  const inks = useRef<(SVGPathElement | null)[]>([])
  const comets = useRef<(SVGPathElement | null)[]>([])
  // Where the pen is, kept across re-layouts so the drawing never restarts. It starts at the top so the first stretch
  // inks itself in on load.
  const pen = useRef(0)

  // Measure the page and lay out the lines; again whenever the page changes size (fonts, images, viewport)
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

    const draw = (penY: number, still = false) => {
      geo.strands.forEach((s, i) => {
        const len = lengthAt(geo.keys, i, penY)
        const ink = inks.current[i]
        if (ink) ink.style.strokeDashoffset = String(s.total - len)
        const comet = comets.current[i]
        if (comet) {
          comet.style.strokeDashoffset = String(COMET - len)
          comet.style.opacity = still || len <= 0 || len >= s.total ? '0' : '1'
        }
      })
    }

    // Still: the finished drawing. Also on boards taller than any screen (full-page canvas captures), which never scroll.
    if (osReduced || innerHeight > 2000) {
      draw(Infinity, true)
      return
    }

    const target = () => scrollY + innerHeight * PEN - (page.getBoundingClientRect().top + scrollY)
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

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <svg width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} fill="none" className="block">
        <defs>
          <Ink id="ledger-trail-ink" h={geo.h} stops={geo.stops} light={0.32} dark={0.42} />
          <Ink id="ledger-trail-comet" h={geo.h} stops={geo.stops} light={0.85} dark={1} />
        </defs>
        <g strokeWidth={geo.stroke} strokeLinecap="round" fill="none">
          {geo.strands.map((s, i) => (
            <path
              key={`ink${i}`}
              ref={(el) => {
                inks.current[i] = el
              }}
              d={s.d}
              stroke="url(#ledger-trail-ink)"
              pathLength={s.total}
              strokeDasharray={s.total}
              strokeDashoffset={s.total}
            />
          ))}
          {geo.strands.map((s, i) => (
            <path
              key={`comet${i}`}
              ref={(el) => {
                comets.current[i] = el
              }}
              d={s.d}
              stroke="url(#ledger-trail-comet)"
              pathLength={s.total}
              strokeDasharray={`${COMET} ${s.total + COMET}`}
              strokeDashoffset={COMET}
              className="opacity-0 transition-opacity duration-(--duration-slow)"
            />
          ))}
        </g>
      </svg>
    </div>
  )
}

/** The ink colour down the page: lime on the forest bands, forest on the sand ones */
function Ink({ id, h, stops, light, dark }: { id: string; h: number; stops: Stop[]; light: number; dark: number }) {
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={h}>
      {stops.map((s, i) => (
        <stop
          key={i}
          offset={s.offset}
          stopColor="currentColor"
          stopOpacity={s.inverse ? dark : light}
          className={s.inverse ? 'text-line-inverse-accent' : 'text-line-brand'}
        />
      ))}
    </linearGradient>
  )
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
  const gap = wide ? 10 : 6 // half the space between the two lines
  const radius = wide ? 28 : 18 // corner radius at the middle of the pair

  // The hero's left gutter, from the page edge to where its content starts
  const body = sections[1].firstElementChild as HTMLElement
  const gutter = rel(body).left + parseFloat(getComputedStyle(body).paddingLeft)

  // The centre of each empty band between one section's content and the next one's: the horizontal runs sit there
  const last = sections.length - 1
  const breakAt = (k: number) => {
    const above = rel(sections[k - 1].firstElementChild ?? sections[k - 1]).bottom
    const below = rel(sections[k].firstElementChild ?? sections[k]).top
    return (above + below) / 2
  }

  // The route of the pair's centreline: down the hero's left gutter from the top of the page, across to the centre,
  // then stepping either side of the centre at each break, back to the centre and down into the closing card.
  const mid = w / 2
  const step = Math.min(220, w * 0.16)
  const card = rel(sections[last].firstElementChild ?? sections[last])
  const route: Pt[] = [{ x: Math.max(gutter / 2, gap + 2), y: 0 }]
  const turn = (x: number, y: number) => {
    const at = route[route.length - 1]
    if (Math.abs(x - at.x) < 1) return
    route.push({ x: at.x, y }, { x, y })
  }
  turn(mid, breakAt(1))
  for (let k = 2; k < last; k++) turn(k % 2 ? mid - step : mid + step, breakAt(k))
  turn(mid, breakAt(last))
  route.push({ x: route[route.length - 1].x, y: card.top + 64 }) // on behind the card

  // Each line is the centreline offset to one side, with corners that share a centre so the gap stays even
  const built = [-gap, gap].map((off) => offsetLine(route, off, radius))
  const strands = built.map((b) => ({ d: b.d, total: b.total }))

  // Pen keyframes. Each horizontal run (with its two corners) is drawn as the pen crosses a window around its break;
  // the drops in between fill the rest. Both lines share the keyframes so they stay side by side.
  const keys: Key[] = [{ pen: 0, len: built.map(() => 0) }]
  for (let c = 1; c + 1 < route.length - 1; c += 2) {
    const run = Math.abs(route[c + 1].x - route[c].x)
    const y = route[c].y
    const half = Math.min(200, Math.max(70, run * 0.3))
    keys.push({ pen: y - half, len: built.map((b) => b.corners[c - 1].start) })
    keys.push({ pen: y + half, len: built.map((b) => b.corners[c].end) })
  }
  keys.push({ pen: route[route.length - 1].y, len: built.map((b) => b.total) })

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

  return { w, h, strands, keys, stops, stroke: wide ? 1.25 : 1 }
}

/**
 * Offsets an orthogonal route sideways by `off` and rounds every corner. The line on the inside of a turn gets a
 * tighter radius and the one outside a wider one, so a pair of offsets stays evenly spaced through every bend.
 * Returns the path, its length, and the length at the start and end of each corner.
 */
function offsetLine(route: Pt[], off: number, radius: number) {
  const dirs = route.slice(1).map((p, i) => unit(route[i], p))
  const normal = (d: Pt) => ({ x: -d.y, y: d.x })
  const shift = (p: Pt, n: Pt) => ({ x: p.x + n.x * off, y: p.y + n.y * off })

  const start = shift(route[0], normal(dirs[0]))
  const segs: Seg[] = []
  const cornerIdx: number[] = []
  for (let i = 1; i < route.length - 1; i++) {
    const din = dirs[i - 1]
    const dout = dirs[i]
    const nin = normal(din)
    const nout = normal(dout)
    const p = { x: route[i].x + (nin.x + nout.x) * off, y: route[i].y + (nin.y + nout.y) * off }
    const inside = off * (nin.x * dout.x + nin.y * dout.y) > 0
    const r = radius + (inside ? -1 : 1) * Math.abs(off)
    const a = { x: p.x - din.x * r, y: p.y - din.y * r }
    const b = { x: p.x + dout.x * r, y: p.y + dout.y * r }
    segs.push({ to: a })
    cornerIdx.push(segs.length)
    segs.push({ c1: { x: a.x + din.x * r * KAPPA, y: a.y + din.y * r * KAPPA }, c2: { x: b.x - dout.x * r * KAPPA, y: b.y - dout.y * r * KAPPA }, to: b })
  }
  segs.push({ to: shift(route[route.length - 1], normal(dirs[dirs.length - 1])) })

  const { d, ends } = trace(start, segs)
  return {
    d,
    total: ends[ends.length - 1],
    corners: cornerIdx.map((j) => ({ start: ends[j - 1], end: ends[j] })),
  }
}

/** Builds the path data and the running length at the end of each segment */
function trace(start: Pt, segs: Seg[]) {
  let d = `M${f(start.x)} ${f(start.y)}`
  let p = start
  let len = 0
  const ends: number[] = []
  for (const s of segs) {
    if (s.c1 && s.c2) {
      d += `C${f(s.c1.x)} ${f(s.c1.y)} ${f(s.c2.x)} ${f(s.c2.y)} ${f(s.to.x)} ${f(s.to.y)}`
      let q = p
      for (let j = 1; j <= 16; j++) {
        const n = cubic(p, s.c1, s.c2, s.to, j / 16)
        len += Math.hypot(n.x - q.x, n.y - q.y)
        q = n
      }
    } else {
      d += `L${f(s.to.x)} ${f(s.to.y)}`
      len += Math.hypot(s.to.x - p.x, s.to.y - p.y)
    }
    ends.push(len)
    p = s.to
  }
  return { d, ends }
}

/** How much of line `i` is drawn when the pen is at height y */
function lengthAt(keys: Key[], i: number, y: number) {
  if (y <= keys[0].pen) return keys[0].len[i]
  for (let k = 1; k < keys.length; k++) {
    const a = keys[k - 1]
    const b = keys[k]
    if (y <= b.pen) return b.pen > a.pen ? a.len[i] + ((y - a.pen) / (b.pen - a.pen)) * (b.len[i] - a.len[i]) : b.len[i]
  }
  return keys[keys.length - 1].len[i]
}

function cubic(a: Pt, b: Pt, c: Pt, d: Pt, t: number): Pt {
  const u = 1 - t
  return {
    x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
    y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y,
  }
}

function unit(a: Pt, b: Pt): Pt {
  const l = Math.hypot(b.x - a.x, b.y - a.y) || 1
  return { x: (b.x - a.x) / l, y: (b.y - a.y) / l }
}

const f = (n: number) => n.toFixed(1)
const clamp01 = (n: number) => Math.min(1, Math.max(0, n))
