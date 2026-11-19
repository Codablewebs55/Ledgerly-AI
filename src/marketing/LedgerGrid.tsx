import { useEffect, useRef } from 'react'
import { useOsReducedMotion } from './motion'

/** Share of the scroll speed the grid moves at: well under 1, so it reads as a layer set back behind the page */
const DRIFT = 0.3
/** Grid pitch in px; the drift wraps at this so the pattern never shows a seam */
const PITCH = 24

/**
 * A faint ledger dot grid behind the landing page. It sits over the section backgrounds but under all content
 * (LandingPage lifts each section's content to z-10), fades out towards the edges of the screen, and drifts upward at
 * a fraction of the scroll speed, so the page gains a quiet sense of depth as it moves. Still under reduced motion.
 */
export function LedgerGrid() {
  const grid = useRef<HTMLDivElement>(null)
  const reduced = useOsReducedMotion()

  useEffect(() => {
    const el = grid.current
    if (!el || reduced) return
    let raf = 0
    const update = () => {
      raf = 0
      el.style.transform = `translate3d(0, ${-((scrollY * DRIFT) % PITCH)}px, 0)`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    addEventListener('scroll', onScroll, { passive: true })
    return () => {
      removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [reduced])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden text-line-strong opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]"
    >
      <div
        ref={grid}
        className="absolute inset-x-0 -top-6 -bottom-6 bg-[radial-gradient(currentColor_1px,transparent_1.5px)] bg-size-[24px_24px] will-change-transform"
      />
    </div>
  )
}
