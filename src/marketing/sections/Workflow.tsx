import type { ReactNode } from 'react'
import { Badge, Card, Money, StatusBadge } from '@/ds'
import { Accent, Reveal, SectionHeading } from '../parts'

type Step = { title: string; body: string; artifact: ReactNode }

// Each step carries a small real piece of the product (design-system components with sample values)
const steps: Step[] = [
  {
    title: 'Create the invoice',
    body: 'Pick a client, add line items and the total keeps up with you.',
    artifact: (
      <span className="flex items-center gap-3">
        <span className="text-body-sm text-fg-muted">INV-1043</span>
        <Money amount={8400} className="text-body-md font-semibold" />
      </span>
    ),
  },
  { title: 'Send it', body: 'It goes out numbered, with the due date already worked out.', artifact: <StatusBadge status="sent" /> },
  { title: 'See it land', body: 'Know the moment a client has opened it, and which ones are slipping.', artifact: <span className="flex gap-2"><StatusBadge status="viewed" /><StatusBadge status="overdue" /></span> },
  { title: 'Get paid', body: 'Payments mark invoices paid and roll into cash collected this month.', artifact: <StatusBadge status="paid" /> },
  { title: 'Match the bank', body: 'Clear the bank transactions waiting to be matched so your books stay current.', artifact: <Badge tone="warning" dot>5 to match</Badge> },
  { title: 'Read the month', body: 'Net cash flow, money in and money out, ready whenever you look.', artifact: <Money amount={65045} signed wholeUnits className="text-body-md font-semibold" /> },
]

/** The loop from invoice to clear books, strung along one ledger line. */
export function Workflow() {
  return (
    <section id="workflow" aria-labelledby="workflow-title" className="scroll-mt-20 bg-canvas py-20 md:py-28">
      <div className="mx-auto max-w-(--ldg-content-max) px-4 md:px-8">
        <SectionHeading
          id="workflow-title"
          eyebrow="How it fits together"
          title={
            <>
              From first invoice to <Accent>clear</Accent> books.
            </>
          }
          intro="Each step feeds the next, so the numbers on your Overview are the same ones behind every invoice and payment."
        />

        <ol className="relative mt-12 grid gap-4 p-4 md:grid-cols-2 md:p-6 lg:mt-16 lg:grid-cols-3">
          {/* The ledger loop: a dashed line that runs round all six steps, marching clockwise. pathLength normalises the
              perimeter so the dash pattern meets itself seamlessly at any size. */}
          <svg aria-hidden className="pointer-events-none absolute inset-0 size-full overflow-visible">
            <rect
              width="100%"
              height="100%"
              rx="24"
              pathLength={1000}
              fill="none"
              strokeWidth="1.5"
              strokeDasharray="3 2"
              strokeLinecap="round"
              className="animate-dash-flow stroke-fg-brand motion-reduce:animate-none"
            />
          </svg>
          {steps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={(i % 3) * 110}>
              <Card radius="xl" padding="none" className="relative flex h-full flex-col p-6">
              <span className="relative z-10 grid size-7 place-items-center rounded-full bg-brand text-label font-semibold text-fg-on-brand">{i + 1}</span>
              <h3 className="mt-5 font-display text-heading-md text-fg">{s.title}</h3>
              <p className="mt-2 text-body-sm text-fg-muted">{s.body}</p>
              <div className="mt-5 flex min-h-8 items-center border-t border-line-subtle pt-4">{s.artifact}</div>
            </Card>
</Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
