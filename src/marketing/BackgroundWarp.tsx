import { useEffect, useRef, type RefObject } from 'react'
import { useOsReducedMotion } from './motion'

/** Radius of the area the warp reaches, in px */
const REACH = 230
/** Spread of the funnel: how wide the pull is felt before it fades */
const SPREAD = 120
/** How far the surface is drawn into the hole at its centre (0–1) */
const DEPTH = 0.42
/** Spacing of the ledger rules the warp is drawn with */
const PITCH = 26
/** How quickly the hole opens, closes and follows the pointer, per frame */
const EASE = 0.14

/**
 * A subtle hole in the landing page's section backgrounds. While the mouse rests on open background, the surface
 * around it sinks into a funnel: a faint ledger grid appears only there and its rules bend down into the cursor,
 * with a little shade pooling at the centre. Everything fades out smoothly with distance, so there is no edge or
 * bubble, just the background seeming to give way under the pointer. The grid is fixed to the page, so it stays put
 * as the hole moves across it. Sits under all content (LandingPage lifts section content to z-10) and never takes
 * clicks; it closes over text, cards, images and controls. Mouse only; absent under reduced motion.
 */
export function BackgroundWarp({ pageRef }: { pageRef: RefObject<HTMLElement | null> }) {
  const reduced = useOsReducedMotion()
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const page = pageRef.current
    const cvs = canvas.current
    const ctx = cvs?.getContext('2d')
    if (!page || !cvs || !ctx || reduced) return

    const root = getComputedStyle(document.documentElement)
    const ink = { light: root.getPropertyValue('--ldg-line-strong').trim(), dark: root.getPropertyValue('--ldg-fg-inverse-subtle').trim() }
    let dpr = 1
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2)
      cvs.width = innerWidth * dpr
      cvs.height = innerHeight * dpr
    }
    size()

    const at = { x: 0, y: 0 }
    const goal = { x: 0, y: 0 }
    let open = 0 // how far the hole is open, 0–1
    let target = 0
    let dark = false
    let raf = 0

    // Where a point of the surface ends up when drawn into the hole
    const sink = (x: number, y: number) => {
      const dx = x - at.x
      const dy = y - at.y
      const r = Math.hypot(dx, dy)
      const pull = DEPTH * open * Math.exp(-((r / SPREAD) ** 2))
      return { x: at.x + dx * (1 - pull), y: at.y + dy * (1 - pull), fade: Math.max(0, 1 - r / REACH) }
    }

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, innerWidth, innerHeight)
      if (open < 0.01) return
      ctx.lineWidth = 1
      ctx.strokeStyle = dark ? ink.dark : ink.light
      // The rules are fixed to the page, so the hole moves across them rather than dragging them along
      const offset = -(scrollY % PITCH)
      const x0 = at.x - REACH
      const x1 = at.x + REACH
      const y0 = at.y - REACH
      const y1 = at.y + REACH
      const rule = (horizontal: boolean, c: number) => {
        let prev: ReturnType<typeof sink> | null = null
        for (let t = horizontal ? x0 : y0; t <= (horizontal ? x1 : y1); t += 6) {
          const p = horizontal ? sink(t, c) : sink(c, t)
          if (prev) {
            ctx.globalAlpha = 0.55 * open * Math.min(prev.fade, p.fade) ** 1.6
            if (ctx.globalAlpha > 0.004) {
              ctx.beginPath()
              ctx.moveTo(prev.x, prev.y)
              ctx.lineTo(p.x, p.y)
              ctx.stroke()
            }
          }
          prev = p
        }
      }
      for (let y = Math.floor((y0 - offset) / PITCH) * PITCH + offset; y <= y1; y += PITCH) rule(true, y)
      for (let x = Math.floor(x0 / PITCH) * PITCH; x <= x1; x += PITCH) rule(false, x)
      // A little shade pooling at the bottom of the hole
      const shade = ctx.createRadialGradient(at.x, at.y, 0, at.x, at.y, SPREAD)
      shade.addColorStop(0, `rgb(0 0 0 / ${(dark ? 0.22 : 0.06) * open})`)
      shade.addColorStop(1, 'rgb(0 0 0 / 0)')
      ctx.globalAlpha = 1
      ctx.fillStyle = shade
      ctx.fillRect(at.x - SPREAD, at.y - SPREAD, SPREAD * 2, SPREAD * 2)
    }

    const tick = () => {
      at.x += (goal.x - at.x) * EASE
      at.y += (goal.y - at.y) * EASE
      open += (target - open) * EASE
      draw()
      const settled = Math.abs(target - open) < 0.005 && Math.hypot(goal.x - at.x, goal.y - at.y) < 0.3
      if (settled && target === 0) {
        open = 0
        draw()
      }
      raf = settled ? 0 : requestAnimationFrame(tick)
    }
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      goal.x = e.clientX
      goal.y = e.clientY
      if (open < 0.01) {
        // Open where the pointer is, not sliding in from wherever it was last
        at.x = goal.x
        at.y = goal.y
      }
      const section = openSection(e.target as Element)
      target = section ? 1 : 0
      if (section) dark = section.classList.contains('bg-inverse')
      wake()
    }
    const close = () => {
      target = 0
      wake()
    }
    const onScroll = () => {
      close()
      draw()
    }
    const onResize = () => {
      size()
      draw()
    }
    page.addEventListener('pointermove', onMove, { passive: true })
    page.addEventListener('pointerleave', close)
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onResize)
    return () => {
      page.removeEventListener('pointermove', onMove)
      page.removeEventListener('pointerleave', close)
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onResize)
      cancelAnimationFrame(raf)
    }
  }, [pageRef, reduced])

  if (reduced) return null
  return <canvas ref={canvas} aria-hidden className="pointer-events-none fixed inset-0 z-0 size-full" />
}

/** The section whose bare background the pointer is on, or null when it is over content */
function openSection(target: Element) {
  const section = target.closest('main > section')
  if (!section) return null
  for (let el: Element | null = target; el && el !== section; el = el.parentElement) {
    if (!/^(DIV|UL|OL|LI)$/.test(el.tagName)) return null
    if ([...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim())) return null
    const cs = getComputedStyle(el)
    const filled = !/^(transparent|rgba\(.*,\s*0\))$/.test(cs.backgroundColor) || cs.backgroundImage !== 'none'
    const bordered = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderRightWidth) + parseFloat(cs.borderBottomWidth) + parseFloat(cs.borderLeftWidth) > 0
    if (filled || bordered) return null
  }
  return section
}
