import { useState } from 'react'
import { Tabs } from '@/ds'
import { cx } from '@/ds/utils/cx'
import { MOTION_ENABLED } from '../motion'
import { Accent, Reveal, SectionHeading, Shot } from '../parts'
import { stills } from '../stills'

const views = [
  {
    id: 'overview',
    label: 'Overview',
    caption: 'Where you stand today: cash, what is owed and overdue, cash flow, and what needs attention.',
    still: stills.overview,
    alt: 'The Ledgerly Overview with headline numbers, a six-month cash flow chart, Ledgerly AI insights, recent invoices and a needs-attention list.',
  },
  {
    id: 'invoices',
    label: 'Invoices',
    caption: 'Every invoice in one list, filtered by drafts, awaiting payment, overdue and paid.',
    still: stills.invoices,
    alt: 'The Invoices list with totals for outstanding, overdue and collected this month, and 16 invoices with status badges.',
  },
  {
    id: 'create',
    label: 'New invoice',
    caption: 'Client, terms and line items on the left; the total, due date and send button on the right.',
    still: stills.createInvoice,
    alt: 'Creating invoice INV-1043 for Northwind Studio for $8,400, with a Ledgerly AI note that Northwind usually pays 6 days late.',
  },
] as const

type ViewId = (typeof views)[number]['id'] | 'mobile'

/** Explore the product: the real screens, one tab at a time, plus the phone layout. */
export function Showcase() {
  const [view, setView] = useState<ViewId>('overview')
  const current = views.find((v) => v.id === view)

  return (
    <section id="showcase" aria-labelledby="showcase-title" className="scroll-mt-20 bg-surface-sunken py-20 md:py-28">
      <div className="mx-auto max-w-(--ldg-content-max) px-4 md:px-8">
        <SectionHeading
          id="showcase-title"
          eyebrow="Take a look around"
          title={
            <>
              The real screens, <Accent>not</Accent> a mock-up.
            </>
          }
          intro="Everything here is captured from the working Ledgerly demo with its sample business, Dafe Studio. Open it yourself any time."
        />

        <Reveal className="mt-10 lg:mt-14">
          <Tabs
            aria-label="Ledgerly screens"
            idPrefix="showcase"
            value={view}
            onValueChange={(id) => setView(id as ViewId)}
            items={[...views.map((v) => ({ id: v.id, label: v.label })), { id: 'mobile', label: 'On your phone' }]}
          />
          <div role="tabpanel" id={`showcase-panel-${view}`} aria-labelledby={`showcase-${view}`} className="pt-8">
            {current ? (
              <figure>
                <div className="max-h-[42rem] overflow-hidden rounded-xl">
                  <Shot key={current.id} still={current.still} alt={current.alt} frame="window" className={cx(MOTION_ENABLED && 'animate-fade-in')} />
                </div>
                <figcaption className="mt-4 text-body-sm text-fg-muted">{current.caption}</figcaption>
              </figure>
            ) : (
              <figure className="grid items-center gap-8 md:grid-cols-2">
                <div className={cx('mx-auto w-[min(18rem,80%)] rounded-[2rem] border-[6px] border-inverse bg-inverse shadow-xl', MOTION_ENABLED && 'animate-fade-in')}>
                  <img
                    src={stills.overviewMobile.src}
                    width={stills.overviewMobile.w}
                    height={stills.overviewMobile.h}
                    alt="Ledgerly on a phone: the Overview with cash on hand $133,912.40, outstanding $52,850.48 and a bottom navigation bar with a create invoice button."
                    loading="lazy"
                    decoding="async"
                    className="block w-full rounded-[1.6rem]"
                  />
                </div>
                <figcaption className="max-w-[28rem]">
                  <h3 className="font-display text-heading-lg text-fg">Your books, in your pocket.</h3>
                  <p className="mt-3 text-body-md text-fg-muted">
                    The same workspace rearranged for a small screen, with the places you visit most in a bottom bar and creating an invoice one tap away.
                  </p>
                </figcaption>
              </figure>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
