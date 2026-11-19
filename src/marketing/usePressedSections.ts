import { useEffect, type RefObject } from 'react'

/**
 * Presses a landing-page section into the page while the mouse rests on its open background: the section gets the
 * `data-pressed` attribute, which LandingPage styles as an inset shadow with the content settling back slightly.
 * Moving onto anything with substance (text, cards, images, buttons, fields) lets it spring back, so reading and
 * clicking are never affected. Mouse only; off when `enabled` is false.
 */
export function usePressedSections(pageRef: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const page = pageRef.current
    if (!page || !enabled) return
    let pressed: Element | null = null
    const press = (section: Element | null) => {
      if (section === pressed) return
      pressed?.removeAttribute('data-pressed')
      pressed = section
      section?.setAttribute('data-pressed', '')
    }
    const onOver = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') press(openSection(e.target as Element))
    }
    const onLeave = () => press(null)
    page.addEventListener('pointerover', onOver)
    page.addEventListener('pointerleave', onLeave)
    return () => {
      page.removeEventListener('pointerover', onOver)
      page.removeEventListener('pointerleave', onLeave)
      press(null)
    }
  }, [pageRef, enabled])
}

/** The section whose bare background the pointer is on, or null when it is over content */
function openSection(target: Element) {
  const section = target.closest('main > section')
  if (!section) return null
  for (let el: Element | null = target; el && el !== section; el = el.parentElement) {
    if (!isOpenGround(el)) return null
  }
  return section
}

/** A plain layout box: no fill, no border, no text of its own */
function isOpenGround(el: Element) {
  if (!/^(DIV|UL|OL|LI)$/.test(el.tagName)) return false
  if ([...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim())) return false
  const cs = getComputedStyle(el)
  return (
    /^(transparent|rgba\(.*,\s*0\))$/.test(cs.backgroundColor) &&
    cs.backgroundImage === 'none' &&
    parseFloat(cs.borderTopWidth) + parseFloat(cs.borderRightWidth) + parseFloat(cs.borderBottomWidth) + parseFloat(cs.borderLeftWidth) === 0
  )
}
