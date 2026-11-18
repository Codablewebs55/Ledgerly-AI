import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

/**
 * Scroll-linked entrances for every section below the hero (the hero text stays still). Section titles split into masked words that rise into
 * place; eyebrows and intros follow. Cards don't scroll in; they lift on hover instead (see `Reveal`). All of
 * it is scrubbed to the scroll position with a lag, so it eases in slowly as the visitor scrolls and settles back if
 * they scroll up. Uses opacity, never visibility, so elements hidden on purpose stay hidden. Skipped under the OS reduced-motion setting.
 */
export function useScrollReveal(root: RefObject<HTMLElement | null>, enabled = true) {
  // Layout effect, so nothing paints in its final state before the entrances hide it
  useLayoutEffect(() => {
    const el = root.current
    if (!el || !enabled) return
    // A window taller than any real screen (a full-page canvas board or capture) never scrolls, so scrubbed
    // entrances would freeze part-way; show every title in place instead
    if (innerHeight > 2000) return

    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>('main section[aria-labelledby]', el).slice(1) // skip the hero, whose text stays still

      sections.forEach((section) => {
        const title = section.querySelector<HTMLElement>('h2')
        if (!title) return
        const split = SplitText.create(title, { type: 'words', mask: 'words' })
        // Room inside each mask for italic overhang and descenders, cancelled out so spacing is unchanged
        gsap.set(split.masks, { padding: '0 0.14em 0.12em 0', margin: '0 -0.14em -0.12em 0' })
        const eyebrow = title.previousElementSibling
        const intro = title.parentElement?.nextElementSibling?.matches('p') ? title.parentElement.nextElementSibling : null

        const tl = gsap.timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: { trigger: title, start: 'top 92%', end: 'top 55%', scrub: 1.4 },
        })
        if (eyebrow) tl.from(eyebrow, { opacity: 0, y: 16, duration: 0.4 }, 0)
        tl.from(split.words, { yPercent: 110, rotate: 4, transformOrigin: '0% 100%', duration: 0.8, stagger: 0.06 }, 0.1)
        if (intro) tl.from(intro, { opacity: 0, y: 24, filter: 'blur(6px)', duration: 0.6 }, 0.35)
      })
    }, el)

    // Images and fonts change section heights after mount; re-measure once they settle
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    document.fonts?.ready.then(refresh)
    return () => {
      window.removeEventListener('load', refresh)
      ctx.revert()
    }
  }, [root, enabled])
}
