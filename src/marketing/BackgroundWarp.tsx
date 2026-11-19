import { useEffect, useRef, type RefObject } from 'react'
import { useOsReducedMotion } from './motion'

/** Diameter of the dimple, in px */
const SIZE = 380
/** How strongly the dimple shows: kept low so it reads as a gentle warp, not a spotlight */
const STRENGTH = 0.5
/** Share of the gap to the pointer the dimple closes each frame: it trails the cursor softly, like a surface settling */
const FOLLOW = 0.16

/**
 * A subtle warp in the landing page's section backgrounds. While the mouse rests on open background, a soft dimple
 * follows it: light catching the near rim and shade pooling on the far side, so the flat colour reads as gently bent
 * under the cursor. Soft-light blending lets the same dimple work on sand and forest bands alike. It fades away over
 * anything with substance (text, cards, images, controls), sits under all content (LandingPage lifts section content
 * to z-10) and never takes clicks. Mouse only; absent under reduced motion.
 */
export function BackgroundWarp({ pageRef }: { pageRef: RefObject<HTMLElement | null> }) {
  const reduced = useOsReducedMotion()
  const dimple = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const page = pageRef.current
    const el = dimple.current
    if (!page || !el || reduced) return

    const at = { x: 0, y: 0 }
    const goal = { x: 0, y: 0 }
    let shown = false
    let raf = 0
    const tick = () => {
      at.x += (goal.x - at.x) * FOLLOW
      at.y += (goal.y - at.y) * FOLLOW
      el.style.transform = `translate3d(${at.x - SIZE / 2}px, ${at.y - SIZE / 2}px, 0)`
      raf = Math.hypot(goal.x - at.x, goal.y - at.y) > 0.3 ? requestAnimationFrame(tick) : 0
    }
    const show = (on: boolean) => {
      if (on === shown) return
      shown = on
      el.style.opacity = on ? String(STRENGTH) : '0'
      el.style.scale = on ? '1' : '0.8'
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      goal.x = e.clientX
      goal.y = e.clientY
      if (!shown) {
        // Appear where the pointer is, not sliding in from wherever it was last
        at.x = goal.x
        at.y = goal.y
      }
      show(onOpenGround(e.target as Element))
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const onLeave = () => show(false)
    page.addEventListener('pointermove', onMove, { passive: true })
    page.addEventListener('pointerleave', onLeave)
    addEventListener('scroll', onLeave, { passive: true })
    return () => {
      page.removeEventListener('pointermove', onMove)
      page.removeEventListener('pointerleave', onLeave)
      removeEventListener('scroll', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [pageRef, reduced])

  if (reduced) return null
  return (
    <div
      ref={dimple}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-0 scale-80 rounded-full opacity-0 mix-blend-soft-light transition-[opacity,scale] duration-(--duration-slower) ease-(--ease-standard) will-change-transform"
      style={{
        width: SIZE,
        height: SIZE,
        // Light on the near rim, shade pooling on the far side: the look of a shallow dent in the surface
        background:
          'radial-gradient(circle at 38% 36%, color-mix(in srgb, var(--color-surface) 70%, transparent) 0%, transparent 46%), radial-gradient(circle at 60% 62%, color-mix(in srgb, var(--color-fg) 70%, transparent) 0%, transparent 58%)',
      }}
    />
  )
}

/** True when the pointer is on a section's bare background rather than on any content */
function onOpenGround(target: Element) {
  const section = target.closest('main > section')
  if (!section) return false
  for (let el: Element | null = target; el && el !== section; el = el.parentElement) {
    if (!/^(DIV|UL|OL|LI)$/.test(el.tagName)) return false
    if ([...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim())) return false
    const cs = getComputedStyle(el)
    const filled = !/^(transparent|rgba\(.*,\s*0\))$/.test(cs.backgroundColor) || cs.backgroundImage !== 'none'
    const bordered = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderRightWidth) + parseFloat(cs.borderBottomWidth) + parseFloat(cs.borderLeftWidth) > 0
    if (filled || bordered) return false
  }
  return true
}
