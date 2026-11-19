import { useEffect, useRef, type RefObject } from 'react'
import { useOsReducedMotion } from './motion'

/** Radius of the hole's shade, in px: it fades to nothing by here, so there is no edge */
const SPREAD = 170
/** How dark the bottom of the hole gets on sand and on forest bands */
const DEPTH = { light: 0.14, dark: 0.4 }
/** How quickly the hole opens, closes and follows the pointer, per frame */
const EASE = 0.14

/**
 * A subtle dark hole in the landing page's section backgrounds. While the mouse rests on open background, shade pools
 * under the pointer, deepest at its centre and fading smoothly to nothing, so the band seems to give way into a soft
 * well there, with no edge or outline. It follows with a slight lag, sits under all content (LandingPage lifts section
 * content to z-10), never takes clicks, and closes over text, cards, images and controls. Mouse only; absent under
 * reduced motion.
 */
export function BackgroundWarp({ pageRef }: { pageRef: RefObject<HTMLElement | null> }) {
  const reduced = useOsReducedMotion()
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const page = pageRef.current
    const cvs = canvas.current
    const ctx = cvs?.getContext('2d')
    if (!page || !cvs || !ctx || reduced) return

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

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, innerWidth, innerHeight)
      if (open < 0.01) return
      // Shade pooling into the hole: deep at the centre, easing off to nothing
      const depth = (dark ? DEPTH.dark : DEPTH.light) * open
      const shade = ctx.createRadialGradient(at.x, at.y, 0, at.x, at.y, SPREAD)
      shade.addColorStop(0, `rgb(0 0 0 / ${depth})`)
      shade.addColorStop(0.3, `rgb(0 0 0 / ${depth * 0.62})`)
      shade.addColorStop(0.65, `rgb(0 0 0 / ${depth * 0.2})`)
      shade.addColorStop(1, 'rgb(0 0 0 / 0)')
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
