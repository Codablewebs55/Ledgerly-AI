import { Quote } from 'lucide-react'
import { Avatar } from '@/ds'
import { cx } from '@/ds/utils/cx'
import { Accent, Reveal, SectionHeading } from '../parts'

// Ledgerly has no customers yet, so these are placeholder quotes written around the sample personas. Every card is
// attributed to a persona, never a named person or business. Swap in real, approved
// customer quotes (with name, role and company) before launch.
const quotes = [
  {
    quote: 'I used to find out a client was late when I checked my bank balance. Now Ledgerly tells me first, and the reminder is already drafted.',
    name: 'James Morales',
    persona: 'Freelance designer',
    detail: 'Invoicing and Ledgerly AI',
  },
  {
    quote: 'Monday mornings start on the Overview. Cash, overdue work and what to set aside for tax, all on one screen.',
    persona: 'Small studio owner',
    detail: 'Overview and Reporting',
  },
  {
    quote: 'Month end used to mean a shoebox of receipts. Now I clear the missing ones as they come up.',
    persona: 'Neighbourhood bakery',
    detail: 'Expenses and Banking',
  },
]

/** Social proof on the forest band. Placeholder quotes until real customers are on record, and the page says so. */
export function Testimonials() {
  const [featured, ...rest] = quotes

  return (
    <section aria-labelledby="testimonials-title" className="bg-inverse py-20 text-fg-inverse md:py-28">
      <div className="mx-auto max-w-[80rem] px-4 md:px-8">
        <SectionHeading
          id="testimonials-title"
          inverse
          eyebrow="What people say"
          title={
            <>
              Less admin. More <Accent inverse>headroom.</Accent>
            </>
          }
          intro="Placeholder quotes written around our sample personas, to show where customer stories will sit. They are not from real customers."
        />

        <div className="mt-12 grid gap-4 lg:mt-16 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <figure className="flex h-full flex-col rounded-2xl bg-accent p-8 text-fg-on-accent md:p-12">
              <Quote className="size-8 md:size-10" aria-hidden />
              <blockquote className="mt-6 font-display text-heading-xl lg:text-display-lg">“{featured.quote}”</blockquote>
              <Attribution {...featured} onAccent className="mt-auto pt-10" />
            </figure>
          </Reveal>

          <div className="flex flex-col gap-4 lg:col-span-5">
            {rest.map((q, i) => (
              <Reveal key={q.persona} delay={(i + 1) * 120} className="flex-1">
                <figure className="flex h-full flex-col rounded-2xl border border-line-inverse bg-inverse-raised p-6 md:p-8">
                  <blockquote className="text-body-md text-fg-inverse md:text-body-lg">“{q.quote}”</blockquote>
                  <Attribution {...q} className="mt-auto pt-8" />
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

type AttributionProps = { name?: string; persona: string; detail: string; onAccent?: boolean; className?: string }

/** Who the quote is attributed to: the persona and what they use. */
function Attribution({ name, persona, detail, onAccent, className }: AttributionProps) {
  return (
    <figcaption className={cx('flex flex-wrap items-center gap-3', className)}>
      <Avatar name={persona} size="lg" shape="square" tone={onAccent ? 'auto' : 'accent'} />
      <div className="min-w-0">
        <p className={cx('text-body-sm font-semibold', onAccent ? 'text-fg-on-accent' : 'text-fg-inverse')}>{name ? `${name} - ${persona}` : persona}</p>
        <p className={cx('text-caption', onAccent ? 'text-fg-on-accent/75' : 'text-fg-inverse-muted')}>{detail}</p>
      </div>
    </figcaption>
  )
}
