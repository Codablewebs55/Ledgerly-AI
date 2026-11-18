import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { Badge } from '@/ds'
import { cx } from '@/ds/utils/cx'
import { Accent, Reveal, SectionHeading, Shot } from '../parts'
import { stills } from '../stills'

const invoicing = [
  'Invoice numbers continue from your last one.',
  'Payment terms set the due date for you.',
  'Totals update line by line as you type',
  'Drafts save as you go',
]

type TileProps = { label: string; title: string; body: string; children: ReactNode; className?: string; centered?: boolean }

/** A feature tile: copy on top, the product fragment on a sunken stage that fills the rest of the tile. */
function Tile({ label, title, body, children, className, centered }: TileProps) {
  return (
    <Reveal className={className}>
      <article className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface">
        <div className="p-6 md:p-8">
          <Badge tone="accent" style={{ backgroundColor: "#000" }}>{label}</Badge>
          <h3 className="mt-4 font-display text-heading-lg text-fg">{title}</h3>
          <p className="mt-2 max-w-[30rem] text-body-sm text-fg-muted md:text-body-md">{body}</p>
        </div>
        <div className={cx('flex flex-1 flex-col bg-surface-sunken px-6 pt-6 md:px-8 md:pt-8', centered ? 'justify-center pb-6 md:pb-8' : 'justify-end')}>{children}</div>
      </article>
    </Reveal>
  )
}

/** The four product areas, each shown with the real screen or panel that does the work. */
export function Capabilities() {
  return (
    <section id="features" aria-labelledby="features-title" className="scroll-mt-20 bg-canvas pb-20 md:pb-28">
      <div className="mx-auto max-w-[80rem] px-4 md:px-8">
        <SectionHeading
          id="features-title"
          eyebrow="What Ledgerly does"
          title={
            <>
              The whole money side of your business, <Accent>in one place.</Accent>
            </>
          }
        />

        {/* Invoicing: the wide feature, the form and the list it feeds */}
        <Reveal className="mt-12 lg:mt-16">
          <article className="grid overflow-hidden rounded-2xl border border-line bg-surface lg:grid-cols-12">
            <div className="flex flex-col p-6 md:p-10 lg:col-span-5">
              <Badge tone="accent">Invoicing</Badge>
              <h3 className="mt-4 font-display text-display-lg text-fg">Get paid without the chasing.</h3>
              <p className="mt-4 mb-6 text-body-md text-fg-muted">
                Pick a client and Ledgerly fills in their email and terms. Add what you did, watch the total, and send. Every invoice then shows whether it has been viewed, is
                overdue or is paid.
              </p>
              {/* Stacked rows: each tucks under the one before and steps a shade darker */}
              <ul className="mt-6 flex flex-col">
                {invoicing.map((item, i) => (
                  <li
                    key={item}
                    style={{ backgroundColor: "var(--ldg-bg-brand)", borderTopColor: "var(--ldg-fg-inverse-accent)", borderRightColor: "var(--ldg-fg-inverse-accent)", borderBottomColor: "var(--ldg-fg-inverse-accent)", borderLeftColor: "var(--ldg-fg-inverse-accent)", borderBottomLeftRadius: "0px", marginTop: "-16px", marginBottom: "0px", borderBottomRightRadius: "0px", color: "var(--color-line-control)" }}
                    className={cx('flex items-center justify-between gap-3 rounded-xl border-2 border-surface/70 px-5 pt-6 pb-8 text-body-md font-medium text-fg', i > 0 && '-mt-2', i === invoicing.length - 1 && 'pb-6')}
                  >
                    {item}
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent text-fg-on-accent ring-1 ring-surface">
                      <Check className="size-3.5" aria-hidden />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative min-h-[18rem] overflow-hidden bg-inverse md:min-h-[26rem] lg:col-span-7">
              <Shot
                still={stills.invoices}
                alt="The Invoices list: 16 invoices with tabs for drafts, awaiting payment, overdue and paid, each row showing client, dates, amount and status."
                frame="window"
                className="absolute top-10 left-10 hidden w-[115%] opacity-60 md:block"
              />
              <Shot
                still={stills.createInvoice}
                alt="Creating invoice INV-1043 for Northwind Studio: one line item, Brand system phase 3, for $8,400, net 30 terms, due Dec 18, 2026."
                frame="window"
                className="absolute top-8 left-6 w-[190%] md:top-28 md:left-24 md:w-[105%]"
              />
            </div>
          </article>
        </Reveal>

        <div className="mt-6 grid gap-6 lg:grid-cols-6">
          <Tile
            className="lg:col-span-4"
            label="Reporting"
            title="See where the money went, month by month."
            body="Money in and out for the last six or twelve months, with net cash flow up top. The current month is marked as still in progress, so a short month never looks like a bad one."
          >
            <Shot
              still={stills.cashflow}
              alt="Cash flow chart: net cash flow +$65,045, money in $182,285 and money out $117,240 across June to November, with November shown as in progress."
              className="aspect-[747/476] rounded-b-none border-b-0"
            />
          </Tile>
          <Tile
            className="lg:col-span-2"
            label="Banking"
            title="Cash on hand, always current."
            body="Your balance and how it moved since last month, next to the bank transactions still waiting to be matched."
            centered
          >
            <Shot still={stills.cash} alt="Cash on hand card: $133,912.40, up 8.6% on last month, with a rising trend line." className="mx-auto w-full max-w-[17rem]" />
          </Tile>
          <Tile
            className="lg:col-span-2"
            label="Expenses"
            title="Nothing slips through."
            body="Ledgerly flags card spend over $75 that is missing a receipt, alongside overdue invoices and drafts you have not sent."
          >
            <Shot
              still={stills.attention}
              alt="Needs attention list: 4 overdue invoices worth $19,950.48, 5 bank transactions to match, 3 receipts missing and 1 draft invoice not sent."
              className="aspect-[365/430] rounded-b-none border-b-0"
            />
          </Tile>
          <Tile
            className="lg:col-span-4"
            label="Tracking"
            title="Every invoice, at a glance."
            body="The last six invoices you issued with who they are for, when they are due and where each one stands, from draft to paid."
          >
            <Shot
              still={stills.recent}
              alt="Recent invoices table: Copperleaf Bakery draft $640, Atlas Logistics paid $8,915.26, Mira Okafor overdue $2,900, Northwind Studio overdue $12,480.48, Lumen Health viewed $22,600 and Harbor & Pine Co. overdue $3,200."
              className="aspect-[747/449] rounded-b-none border-b-0"
            />
          </Tile>
        </div>
      </div>
    </section>
  )
}
