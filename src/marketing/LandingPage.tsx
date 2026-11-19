import { useEffect, useRef } from 'react'
import { AiMagician } from './AiMagician'
import { BackgroundWarp } from './BackgroundWarp'
import { CursorRing } from './CursorRing'
import { Hero } from './Hero'
import { MarketingNav } from './MarketingNav'
import { useOsReducedMotion } from './motion'
import { Assistant } from './sections/Assistant'
import { Capabilities } from './sections/Capabilities'
import { Faq } from './sections/Faq'
import { FinalCta } from './sections/FinalCta'
import { Footer } from './sections/Footer'
import { Personas } from './sections/Personas'
import { Pricing } from './sections/Pricing'
import { Testimonials } from './sections/Testimonials'
import { ValueProp } from './sections/ValueProp'
import { Workflow } from './sections/Workflow'
import { useScrollReveal } from './useScrollReveal'
import { useSmoothScroll } from './useSmoothScroll'

/** Ledgerly marketing site at `/`. */
export default function LandingPage() {
  // Wheel scrolling at roughly half speed, eased by GSAP
  useSmoothScroll()
  // Titles and cards ease in as each section scrolls into view
  const pageRef = useRef<HTMLDivElement>(null)
  useScrollReveal(pageRef, !useOsReducedMotion())

  // Once the page has settled, fetch and decode every lazy product still in the background, so scrolling never has to
  // stop and decode a large image the first time it comes into view
  useEffect(() => {
    const page = pageRef.current
    if (!page) return
    const warm = () =>
      page.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => {
        img.loading = 'eager'
        img.decode().catch(() => {})
      })
    const idle = window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 1200))
    const cancel = window.cancelIdleCallback ?? window.clearTimeout
    const id = idle(warm)
    return () => cancel(id)
  }, [])

  useEffect(() => {
    document.title = 'Ledgerly · Financial management, made easy'

    // No white rubber-band past any edge of the page: stop the overscroll bounce in both directions, and where a browser
    // still bounces, paint the exposed edges to match (forest above, lime below). Restored when leaving the page.
    const root = document.documentElement.style
    const prev = { overscrollBehavior: root.overscrollBehavior, background: root.background }
    root.overscrollBehavior = 'none' // both axes: no sideways rubber-band either
    root.background = 'linear-gradient(var(--ldg-bg-inverse) 50%, var(--ldg-bg-accent) 50%) fixed'
    return () => {
      root.overscrollBehavior = prev.overscrollBehavior
      root.background = prev.background
    }
  }, [])

  return (
    // Each section's (and the footer's) content is lifted to z-10 so the background warp (z-0) bends the section
    // backgrounds but never sits over anything on them
    <div ref={pageRef} className="min-h-screen overflow-x-clip bg-canvas [&_section>*]:relative [&_section>*]:z-10 [&>footer>*]:relative [&>footer>*]:z-10">
      <a href="#main" className="sr-only z-50 rounded-md bg-accent px-4 py-2 text-fg-on-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      <MarketingNav />
      <main id="main">
        <Hero />
        <ValueProp />
        <Capabilities />
        <Assistant />
        <Workflow />
        <Personas />
        <Testimonials />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <BackgroundWarp pageRef={pageRef} />
      <AiMagician />
      <CursorRing />
    </div>
  )
}
