import { ArrowRight } from 'lucide-react'
import { Button } from '@/ds'
import { Accent } from '../parts'
import { useOsReducedMotion } from '../motion'
import { ElectricLines } from '../ElectricLines'

/** The closing band: one last invitation to open the demo, on a forest card with electric current running along its right side. */
export function FinalCta() {
  // The current runs even with the page-wide motion switch off; only the visitor's OS setting stills it
  const reduced = useOsReducedMotion()

  return (
    <section aria-labelledby="cta-title" className="bg-canvas px-4 pb-20 md:px-8 md:pb-28">
      {/* 76rem = the 80rem page container minus its 2rem side padding, so the card lines up with every other section */}
      <div className="relative isolate mx-auto max-w-[76rem] overflow-hidden rounded-2xl bg-inverse text-fg-inverse">
        {/* Current lines on the right half only, fading in from behind the copy */}
        <ElectricLines still={reduced} className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-[60%] max-md:hidden" />
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
