import { useEffect, useState, type RefObject } from 'react'

/** Page-wide motion switch for the landing page. Off for now: no load-in, scroll or reveal animation, and the hero field holds still. */
export const MOTION_ENABLED = false

/** True when the visitor asked the OS for less motion, ignoring the page switch. Updates live. For motion asked for explicitly despite the switch. */
export function useOsReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduced
}

/** True when motion should hold still: the visitor asked the OS for less, or the page switch is off. */
export function useReducedMotion() {
  return useOsReducedMotion() || !MOTION_ENABLED
}

/**
 * Writes an eased copy of the page's scroll offset (px, unitless) to the CSS variable `--y` on an element. Each frame
 * closes `ease` of the gap to the real offset, so motion keyed to it starts gently and settles slowly however fast the
 * wheel turns. The loop only runs while catching up. Skipped entirely under reduced motion.
 */
export function useEasedScroll(ref: RefObject<HTMLElement | null>, ease = 0.06) {
  useEffect(() => {
    const el = ref.current
    if (!el || !MOTION_ENABLED || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let current = window.scrollY
    let frame = 0
    const step = () => {
      const gap = window.scrollY - current
      current = Math.abs(gap) < 0.5 ? window.scrollY : current + gap * ease
      el.style.setProperty('--y', current.toFixed(2))
      frame = current === window.scrollY ? 0 : requestAnimationFrame(step)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(step)
    }
    el.style.setProperty('--y', current.toFixed(2))
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [ref, ease])
}

/**
 * Writes how far an element has travelled through the viewport to the CSS
 * variable `--p` on it: 0 when its top meets the viewport bottom, 1 when its
 * bottom leaves the top. Styles read it (`calc(var(--p) * …)`), so scrolling
 * never re-renders React. Skipped entirely under reduced motion.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled || !MOTION_ENABLED || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const update = () => {
      frame = 0
      const r = el.getBoundingClientRect()
      const p = (window.innerHeight - r.top) / (window.innerHeight + r.height)
      el.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(4))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ref, enabled])
}
