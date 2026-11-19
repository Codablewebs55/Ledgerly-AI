import { useEffect, useRef } from 'react'
import { AiMagician } from './AiMagician'
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
    <div ref={pageRef} className="min-h-screen overflow-x-clip bg-canvas">
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
      <AiMagician />
      <CursorRing />
    </div>
  )
}
