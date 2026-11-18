import { useEffect } from 'react'
import gsap from 'gsap'

/**
 * Slower, eased wheel scrolling for the marketing page. Wheel input moves a target position at a fraction of its
 * native speed and GSAP's ticker eases the window toward it. Keyboard, scrollbar, anchor links and touch keep the
 * browser's own scrolling: the target resyncs to wherever the page actually is whenever the wheel is idle.
 * Off for touch-only devices and under the OS reduced-motion setting.
 */
export function useSmoothScroll({ speed = 0.55, ease = 0.085, enabled = true } = {}) {
  useEffect(() => {
    if (!enabled) return
    if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const root = document.documentElement
    const prevBehavior = root.style.scrollBehavior
    root.style.scrollBehavior = 'auto' // CSS smooth scrolling would fight the ticker

    const max = () => root.scrollHeight - innerHeight
    let target = scrollY
    let current = scrollY
    let active = false

    const onWheel = (e: WheelEvent) => {
      // Leave zoom gestures, horizontal swipes and scrollable children (menus, sheets) alone
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
      if (e.target instanceof Element && e.target.closest('[data-native-scroll], [role="dialog"]')) return
      e.preventDefault()
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1
      if (!active) current = target = scrollY
      target = gsap.utils.clamp(0, max(), target + e.deltaY * unit * speed)
      active = true
    }

    const tick = () => {
      if (!active) return
      // Something else moved the page (keys, scrollbar, an anchor jump): let it win
      if (Math.abs(scrollY - current) > 2) {
        active = false
        return
      }
      current += (target - current) * ease
      if (Math.abs(target - current) < 1) {
        current = target
        active = false
      }
      scrollTo(0, current)
    }

    addEventListener('wheel', onWheel, { passive: false })
    gsap.ticker.add(tick)
    return () => {
      removeEventListener('wheel', onWheel)
      gsap.ticker.remove(tick)
      root.style.scrollBehavior = prevBehavior
    }
  }, [speed, ease, enabled])
}
