import { ArrowRight, Check } from 'lucide-react'
import { Badge, Button } from '@/ds'
import { cx } from '@/ds/utils/cx'
import { Accent, Reveal, SectionHeading } from '../parts'

// Prototype pricing for this demo, labelled as such on the page
const plans = [
  {
    name: 'Starter',
    price: 12,
    for: 'For freelancers getting their books in order.',
    features: ['1 user', 'Unlimited invoices and clients', 'Expense tracking', 'Cash flow overview', 'Email support'],
  },
  {
    name: 'Pro',
    price: 29,
    for: 'For growing businesses that want answers, not just records.',
    features: ['Up to 3 users', 'Everything in Starter', 'Ledgerly AI insights', 'Bank transaction matching', 'Reports, month by month'],
    recommended: true,
  },
  {
    name: 'Scale',
    price: 59,
    for: 'For teams running more of the business through Ledgerly.',
    features: ['Up to 10 users', 'Everything in Pro', 'Custom invoice branding', 'Priority support'],
  },
]

export function Pricing() {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-20 bg-canvas pb-20 md:pb-28">
      <div className="mx-auto max-w-[80rem] px-4 md:px-8">
        <SectionHeading
          id="pricing-title"
          eyebrow="Pricing"
          title={
            <>
              Simple plans. <Accent>No</Accent> surprises.
            </>
          }
          intro="Start with the demo, no card needed. Pick a plan when you are ready, and change it whenever your business does."
        />

        <ul className="mt-12 grid gap-4 lg:mt-16 lg:grid-cols-3 lg:items-stretch">
          {plans.map((p, i) => (
            <Reveal as="li" key={p.name} delay={i * 110}>
              <article
                aria-labelledby={`plan-${p.name}`}
                className={cx(
                  'flex h-full flex-col rounded-2xl border p-6 md:p-8',
                  p.recommended ? 'border-transparent bg-inverse text-fg-inverse shadow-xl' : 'border-line bg-surface text-fg',
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 id={`plan-${p.name}`} className="font-display text-heading-lg">
                    {p.name}
                  </h3>
                  {p.recommended && <Badge tone="accent" style={{ color: "var(--ldg-fg-brand)" }}>Recommended</Badge>}
                </div>
                <p className={cx('mt-2 text-body-sm', p.recommended ? 'text-fg-inverse-muted' : 'text-fg-muted')}>{p.for}</p>
                <p className="mt-6 flex items-baseline gap-1.5">
                  <span className="font-display text-display-lg">${p.price}</span>
                  <span className={cx('text-body-sm', p.recommended ? 'text-fg-inverse-muted' : 'text-fg-muted')}>per month</span>
                </p>
                <ul className="mt-6 flex flex-col gap-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-body-sm">
                      <Check className={cx('mt-0.5 size-4 shrink-0', p.recommended ? 'text-fg-inverse-accent' : 'text-fg-brand')} aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  <Button to="/app" variant={p.recommended ? 'accent' : 'secondary'} size="lg" fullWidth icon={ArrowRight} iconPosition="end">
                    Start with {p.name}
                  </Button>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
