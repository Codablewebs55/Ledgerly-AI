import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { useOsReducedMotion } from './motion'

// A pair of parallel dashed hairlines that ink themselves in as the page scrolls. They drop from the very top of the
// page, behind the header, down the hero's left gutter, turn in a clean rounded corner towards the centre, and from
// there step down the page: a straight run across each section break, then straight down again. The route is worked
// out from the page itself so the lines never cross any copy, card or image: they keep to the open lanes close to the
// page edges and come into the middle only twice, beside the "Everything financial" heading and over the top of the
// FAQ questions (dropping between the FAQ heading and the list). The
// two lines keep an even gap the whole way (their corners are concentric), so they never touch or cross. They end by
// plugging into the closing card.
//
// Scroll position drives the pen. Each horizontal run is drawn while its break passes the pen line, and the drops in
// between are drawn as the section scrolls by, so scrolling back up retracts the lines along exactly the path they
// drew. A flickering fire leads each tip.
//
// The lines sit above every section background but under all content (LandingPage lifts each section's content to
// z-10), and recolour per band: forest on the sand sections, lime on the forest ones, blended across each break.

type Pt = { x: number; y: number }
type Seg = { to: Pt; c1?: Pt; c2?: Pt }

type Strand = { d: string; total: number }
type Key = { pen: number; len: number[] }
type Stop = { offset: number; inverse: boolean }
type Geometry = { w: number; h: number; strands: Strand[]; keys: Key[]; stops: Stop[]; stroke: number }

/** How much of the gap to the scroll position the pen closes each frame: low, so the lines draw slowly and calmly */
const EASE = 0.05
/** Where the pen sits in the viewport: the tips trail just past the middle of the screen */
const PEN = 0.58
/**
 * The brand-lime fire leading each tip, as layered streaks that all end at the tip: a long fading tail of flame, a
 * wide halo, the flame itself and a short white-hot core
 */
const EMBER = [
  { length: 300, width: 1, opacity: 0.45, color: 'text-ember-flame' },
  { length: 110, width: 7, opacity: 0.22, color: 'text-ember-glow' },
  { length: 70, width: 2.6, opacity: 0.9, color: 'text-ember-flame' },
  { length: 24, width: 1.4, opacity: 1, color: 'text-ember-core' },
]
/** Bezier handle length for a quarter circle */
const KAPPA = 0.5523

export function LedgerTrail({ pageRef }: { pageRef: RefObject<HTMLDivElement | null> }) {
  const osReduced = useOsReducedMotion()
  const [geo, setGeo] = useState<Geometry | null>(null)
  const inks = useRef<(SVGPathElement | null)[]>([])
  const comets = useRef<(SVGGElement | null)[]>([])
  const flames = useRef<(SVGGElement | null)[]>([])
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
          EMBER.forEach((e, j) => {
            const streak = comet.children[j + 1] as SVGPathElement | undefined // after the <animate>
            if (streak) streak.style.strokeDashoffset = String(e.length - len)
          })
          const live = !still && len > 0 && len < s.total
          comet.style.opacity = live ? '1' : '0'
          const flame = flames.current[i]
          if (live && flame && ink) {
            const p = ink.getPointAtLength(len)
            flame.setAttribute('transform', `translate(${p.x} ${p.y})`)
          }
        }
      })
    }

    // Still: the finished drawing. Also on boards taller than any screen (full-page canvas captures), which never scroll.
    if (osReduced || innerHeight > 2000) {
      draw(Infinity, true)
      return
    }

    const target = () => scrollY + innerHeight * PEN - (page.getBoundingClientRect().top + scrollY)
    // The pen glides after the scroll, so even a fast flick of the wheel draws in one slow, smooth stroke
    let last = 0
    let raf = 0
    const tick = (now: number) => {
      const goal = target()
      const dt = last ? Math.min(now - last, 64) : 16.7
      last = now
      pen.current += (goal - pen.current) * (1 - Math.pow(1 - EASE, dt / 16.7))
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
    <div aria-hidden data-ledger-trail className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <svg width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} fill="none" className="block">
        <defs>
          <Ink id="ledger-trail-ink" h={geo.h} stops={geo.stops} light={0.45} dark={0.55} />
          {/* What has been drawn so far: solid strokes that uncover the dashed lines */}
          <mask id="ledger-trail-drawn" maskUnits="userSpaceOnUse" x="0" y="0" width={geo.w} height={geo.h}>
            {geo.strands.map((s, i) => (
              <path
                key={i}
                ref={(el) => {
                  inks.current[i] = el
                }}
                d={s.d}
                stroke="white"
                strokeWidth={geo.stroke + 6}
                fill="none"
                pathLength={s.total}
                strokeDasharray={s.total}
                strokeDashoffset={s.total}
              />
            ))}
          </mask>
        </defs>

        <g mask="url(#ledger-trail-drawn)" stroke="url(#ledger-trail-ink)" strokeWidth={geo.stroke} strokeDasharray="6 5" fill="none">
          {geo.strands.map((s, i) => (
            <path key={i} d={s.d} />
          ))}
        </g>

        {/* The ember at each tip: a solid streak that brightens towards the tip, with a soft glow, flickering */}
        {geo.strands.map((s, i) => (
          <g
            key={i}
            ref={(el) => {
              comets.current[i] = el
            }}
            strokeLinecap="round"
            fill="none"
            className="opacity-0 transition-opacity duration-(--duration-slow)"
          >
            <animate attributeName="stroke-opacity" values="1;0.55;0.95;0.7;1" dur="0.9s" repeatCount="indefinite" />
            {EMBER.map((e, j) => (
              <path
                key={j}
                d={s.d}
                stroke="currentColor"
                className={e.color}
                strokeWidth={geo.stroke * e.width}
                opacity={e.opacity}
                pathLength={s.total}
                strokeDasharray={`${e.length} ${s.total + e.length}`}
                strokeDashoffset={e.length}
              />
            ))}
            {/* The flame at the tip: a flickering halo around a white-hot centre */}
            <g
              ref={(el) => {
                flames.current[i] = el
              }}
              stroke="none"
            >
              <circle r={geo.stroke * 7} fill="currentColor" className="text-ember-glow" opacity={0.3}>
                <animate attributeName="r" values={flicker(geo.stroke * 7)} dur="0.7s" repeatCount="indefinite" />
              </circle>
              <circle r={geo.stroke * 3.2} fill="currentColor" className="text-ember-flame">
                <animate attributeName="r" values={flicker(geo.stroke * 3.2)} dur="0.45s" repeatCount="indefinite" />
              </circle>
              <circle r={geo.stroke * 1.4} fill="currentColor" className="text-ember-core" />
            </g>
          </g>
        ))}
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

/** Measures with every entrance and scroll transform switched off, so the layout is where things come to rest */
function measure(page: HTMLElement): Geometry | null {
  if (!document.getElementById('ledger-trail-rest')) {
    const style = document.createElement('style')
    style.id = 'ledger-trail-rest'
    style.textContent =
      '[data-trail-measure] *{transform:none!important;translate:none!important;scale:none!important;rotate:none!important}[data-trail-still] *{transition:none!important}'
    document.head.append(style)
  }
  page.setAttribute('data-trail-still', '')
  page.setAttribute('data-trail-measure', '')
  try {
    return layout(page)
  } finally {
    // Put the transforms back while transitions are still off, so nothing animates back into place
    page.removeAttribute('data-trail-measure')
    void page.offsetHeight
    page.removeAttribute('data-trail-still')
  }
}

function layout(page: HTMLElement): Geometry | null {
  const sections = Array.from(page.querySelectorAll<HTMLElement>(':scope > main > section'))
  if (sections.length < 3) return null
  const origin = page.getBoundingClientRect()
  const rel = (el: Element | Range) => {
    const r = el.getBoundingClientRect()
    return { top: r.top - origin.top, bottom: r.bottom - origin.top, left: r.left - origin.left, right: r.right - origin.left }
  }

  const w = page.clientWidth
  const h = page.scrollHeight
  const wide = w >= 768
  const gap = wide ? 10 : 4 // half the space between the two lines
  const radius = wide ? 28 : 18 // corner radius at the middle of the pair

  // The hero's left gutter, from the page edge to where its content starts
  const body = sections[1].firstElementChild as HTMLElement
  const gutter = rel(body).left + parseFloat(getComputedStyle(body).paddingLeft)

  // Where the horizontal runs sit: in the empty band between one section's content and the next one's. Where a
  // section opens with a rule along its top (the FAQ), the run sits just under the rule, along the top of the content.
  const last = sections.length - 1
  const breakAt = (k: number) => {
    const s = sections[k]
    const above = rel(sections[k - 1].firstElementChild ?? sections[k - 1]).bottom
    const below = rel(s.firstElementChild ?? s).top
    const top = rel(s).top
    return parseFloat(getComputedStyle(s).borderTopWidth) > 0 && below - top > 40 ? (top + below) / 2 : (above + below) / 2
  }

  const mid = w / 2
  // Everything on the page the lines must not cross: text, cards, panels, images
  const texts = obstacles(page, rel)
  const clear = gap + (wide ? 4 : 2)
  const minRun = 2 * (radius + gap) + 4
  /** The stretches of x with nothing in the way between y0 and y1 */
  const clearSpans = (y0: number, y1: number) => {
    const blocked = texts
      .filter((r) => r.bottom > y0 && r.top < y1)
      .map((r) => [r.left - clear, r.right + clear])
      .sort((a, b) => a[0] - b[0])
    const spans: [number, number][] = []
    let from = gap + 1
    for (const [a, b] of blocked) {
      if (a >= from) spans.push([from, a])
      from = Math.max(from, b)
    }
    if (w - gap - 1 >= from) spans.push([from, w - gap - 1])
    return spans
  }
  /** The clear column between y0 and y1 nearest the centre, kept at least `away` from x = `from`; null if none */
  const middle = (y0: number, y1: number, from: number) => {
    let best: number | null = null
    for (const [a, b] of clearSpans(y0, y1)) {
      const x = Math.min(Math.max(mid, a), b)
      if (Math.abs(x - from) >= minRun && Math.abs(x - mid) < w * 0.3 && (best === null || Math.abs(x - mid) < Math.abs(best - mid))) best = x
    }
    return best
  }

  // The route of the pair's centreline. It keeps to the open lanes along the page edges, coming into the middle only
  // twice: beside the "Everything financial" heading, and over the top of the FAQ questions.
  const card = rel(sections[last].firstElementChild ?? sections[last])
  const breaks = sections.map((_, k) => (k === 0 ? 0 : breakAt(k)))
  // As close to the edge as the pair fits; on phones, right against it
  const lane = wide ? Math.max(gap + 1, Math.min(gap + 12, gutter - clear)) : gap + 1
  const left = lane
  const right = w - lane
  const route: Pt[] = [{ x: left, y: 0 }] // down the hero's left edge from behind the header
  const at = () => route[route.length - 1]
  const turn = (x: number, y: number) => {
    if (Math.abs(x - at().x) < 1) return
    route.push({ x: at().x, y }, { x, y })
  }

  // The value section: in to the open space beside its heading, down past it, then out to the right edge in the gap
  // above the cards. Where the heading fills the width, straight across instead.
  const valueBody = sections[1].firstElementChild
  const heading = valueBody?.children[0]
  const below = valueBody?.children[1]
  const turnAt = heading && below ? (rel(heading).bottom + rel(below).top) / 2 : breaks[1]
  const besideHeading = turnAt - breaks[1] >= 2 * (radius + gap) + 8 ? middle(breaks[1], turnAt, left) : null
  if (besideHeading !== null) {
    turn(besideHeading, breaks[1])
    turn(right, turnAt)
  } else turn(right, breaks[1])

  // Down the right edge to the FAQ, then along the top of the questions and down between the heading and the list
  const faq = sections.findIndex((s) => s.id === 'faq')
  if (faq > 0 && faq < last) {
    const x = middle(breaks[faq], breaks[last], at().x)
    if (x !== null) turn(x, breaks[faq])
  }

  // Into the card: across to clear its rounded corner if the line is outside it, then down behind it
  const inside = Math.min(Math.max(at().x, card.left + minRun), card.right - minRun)
  if (Math.abs(inside - at().x) >= 1) turn(Math.abs(inside - at().x) < minRun ? at().x + Math.sign(inside - at().x) * minRun : inside, breaks[last])
  route.push({ x: at().x, y: card.top + 64 })

  // Each line is the centreline offset to one side, with corners that share a centre so the gap stays even
  const built = [-gap, gap].map((off) => offsetLine(route, off, radius))
  const strands = built.map((b) => ({ d: b.d, total: b.total }))

  // Pen keyframes. Each horizontal run (with its two corners) is drawn as the pen crosses a wide window around its
  // break, so a long run across the page takes a good stretch of scrolling and never shoots across; the drops in
  // between fill the rest. Neighbouring windows that would overlap meet halfway. Both lines share the keyframes so
  // they stay side by side.
  const end = route[route.length - 1].y
  const windows: { from: number; to: number; c: number }[] = []
  for (let c = 1; c + 1 < route.length - 1; c += 2) {
    const half = Math.min(450, Math.max(160, Math.abs(route[c + 1].x - route[c].x) * 0.5))
    windows.push({ from: route[c].y - half, to: route[c].y + half, c })
  }
  windows.forEach((win, i) => {
    const prev = windows[i - 1]
    if (prev && win.from < prev.to) win.from = prev.to = (win.from + prev.to) / 2
    win.from = Math.max(win.from, 0)
    win.to = Math.min(win.to, end)
  })
  const keys: Key[] = [{ pen: 0, len: built.map(() => 0) }]
  for (const { from, to, c } of windows) {
    keys.push({ pen: from, len: built.map((b) => b.corners[c - 1].start) })
    keys.push({ pen: Math.max(from, to), len: built.map((b) => b.corners[c].end) })
  }
  keys.push({ pen: end, len: built.map((b) => b.total) })

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

type Box = { top: number; bottom: number; left: number; right: number }

/**
 * Boxes of everything the lines must keep clear of: each piece of text, and every card, panel, image or bordered
 * box inside the sections (each clipped to any ancestor that clips it). Section backgrounds themselves are open
 * ground. The header is left out: it rides along with the scroll.
 */
function obstacles(page: HTMLElement, rel: (el: Element | Range) => Box) {
  const out: Box[] = []
  const keep = (r: Box) => {
    if (r.right - r.left > 1 && r.bottom - r.top > 1) out.push(r)
  }
  const walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    // Skip text nobody sees: screen-reader-only labels and the answers inside closed FAQ items
    if (!n.textContent?.trim() || n.parentElement?.closest('header, [data-ledger-trail], .sr-only, details:not([open]) > :not(summary)')) continue
    range.selectNodeContents(n)
    keep(rel(range))
  }
  for (const el of page.querySelectorAll<HTMLElement>('main section *')) {
    if (el.closest('[data-ledger-trail]')) continue
    const cs = getComputedStyle(el)
    const solid =
      /^(IMG|CANVAS|VIDEO|INPUT|TEXTAREA|SELECT|BUTTON)$/.test(el.tagName) ||
      !/^(transparent|rgba\(.*,\s*0\))$/.test(cs.backgroundColor) ||
      cs.backgroundImage !== 'none' ||
      parseFloat(cs.borderTopWidth) + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth) + parseFloat(cs.borderBottomWidth) > 0
    if (!solid || el.parentElement?.tagName === 'SECTION' && el.parentElement === el.closest('section') && cs.backgroundColor === 'rgba(0, 0, 0, 0)') continue
    const r = rel(el)
    for (let a = el.parentElement; a && a.tagName !== 'SECTION'; a = a.parentElement) {
      const o = getComputedStyle(a)
      if (o.overflowX !== 'visible' || o.overflowY !== 'visible') {
        const c = rel(a)
        r.left = Math.max(r.left, c.left)
        r.right = Math.min(r.right, c.right)
        r.top = Math.max(r.top, c.top)
        r.bottom = Math.min(r.bottom, c.bottom)
      }
    }
    keep(r)
  }
  return out
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
/** Radius keyframes for a flame that flickers around r */
const flicker = (r: number) => [1, 1.3, 0.85, 1.2, 0.95, 1].map((k) => f(r * k)).join(';')
const clamp01 = (n: number) => Math.min(1, Math.max(0, n))
