import { ArrowRight } from 'lucide-react'
import { Button } from '@/ds'
import { Accent } from '../parts'
import { useReducedMotion } from '../motion'
import { PatternWaves } from '../PatternWaves'

/** The closing band: one last invitation to open the demo, on a forest card with a slow halftone wave behind the copy. */
export function FinalCta() {
  const reduced = useReducedMotion()

  return (
    <section aria-labelledby="cta-title" className="bg-canvas px-4 pb-20 md:px-8 md:pb-28">
      <div className="relative isolate mx-auto max-w-[80rem] overflow-hidden rounded-2xl bg-inverse text-fg-inverse">
        {/* Transparent canvas: the marks blend straight onto the forest fill. Slow drift, and a cursor dome that eases in just as slowly. */}
        <PatternWaves
          color="var(--ldg-fg-inverse)"
          fade="edges"
          fadeSize={0.5}
          interactive
          cursorSize={50}
          cursorStrength={0.6}
          cursorEase={0.03}
          pattern="dot"
          spacing={9}
          markSize={0.95}
          depth={0.95}
          light={0}
          shine={0.8}
          contrast={1.2}
          speed={0.12}
          scale={1}
          direction={20}
          opacity={0.35}
          intro
          still={reduced}
          className="absolute inset-0 -z-10"
        />
        <div className="px-6 py-16 md:px-12 md:py-24 lg:max-w-[48rem] lg:px-16">
          <h2 id="cta-title" className="font-display text-display-lg md:text-display-xl">
            Untangle your books. <Accent inverse>Today.</Accent>
          </h2>
          <p className="mt-5 max-w-[34rem] text-body-md text-fg-inverse-muted md:text-body-lg">
            Open the demo workspace and click around. No sign-up, no card, and nothing you do leaves your browser.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/app" variant="accent" size="lg" icon={ArrowRight} iconPosition="end">
              Get started for free
            </Button>
            <Button to="/app/invoices/new" variant="inverse" size="lg">
              Create an invoice
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
