import { FileText, Landmark, LineChart, Receipt } from 'lucide-react'
import { Accent, Reveal, SectionHeading, Shot } from '../parts'
import { stills } from '../stills'

const pillars = [
  { icon: FileText, title: 'Invoices', body: 'Create, send and follow every invoice to paid.' },
  { icon: Receipt, title: 'Expenses', body: 'Know which card spend is still missing a receipt.' },
  { icon: Landmark, title: 'Banking', body: 'See cash on hand and what is left to match.' },
  { icon: LineChart, title: 'Reporting', body: 'Read money in and out, month by month.' },
]

/** The one-line promise, the four areas Ledgerly covers, and the numbers you see first thing each day. */
export function ValueProp() {
  return (
    <section aria-labelledby="value-title" className="bg-canvas py-20 md:py-28">
      <div className="mx-auto max-w-(--ldg-content-max) px-4 md:px-8">
        <SectionHeading
          id="value-title"
          title={
            <>
              Everything financial. Nothing <Accent>complicated.</Accent>
            </>
          }
        />

        <ul className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 90} className="flex flex-col gap-3 bg-surface p-6">
              <span className="grid size-10 place-items-center rounded-md bg-accent-subtle text-fg-brand">
                <p.icon className="size-5" aria-hidden />
              </span>
              <h3 className="font-display text-heading-md text-fg">{p.title}</h3>
              <p className="text-body-sm text-fg-muted">{p.body}</p>
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-6 hidden md:block">
          <Shot
            still={stills.metrics}
            alt="Four headline numbers from the Overview: cash on hand $133,912.40, outstanding $52,850.48 across 6 open invoices, overdue $19,950.48 across 4, and $24,965.26 collected this month."
            className="border-none bg-transparent shadow-none"
          />
        </Reveal>
      </div>
    </section>
  )
}
