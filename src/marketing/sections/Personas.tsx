import { Avatar, Badge } from '@/ds'
import { Accent, Reveal, SectionHeading } from '../parts'

// Illustrative scenarios for who Ledgerly is built for. These are not customers and not quotes, and the page says so.
const personas = [
  {
    name: 'Freelance designer',
    who: 'Works alone with a handful of retainer clients',
    need: 'Sends invoices from one place, sees at a glance who has opened them, and gets a nudge when a regular client is paying later than usual.',
    uses: ['Invoicing', 'Ledgerly AI'],
  },
  {
    name: 'Small studio owner',
    who: 'Runs a team of five with project-based billing',
    need: 'Keeps an eye on cash on hand and overdue work, and knows roughly what to set aside for tax each quarter without opening a spreadsheet.',
    uses: ['Overview', 'Reporting'],
  },
  {
    name: 'Neighbourhood bakery',
    who: 'Handles card spend, suppliers and a few wholesale accounts',
    need: 'Catches card purchases missing a receipt and clears the bank transactions waiting to be matched before month end.',
    uses: ['Expenses', 'Banking'],
  },
]

/** Who Ledgerly is for, as clearly labelled sample personas rather than invented testimonials. */
export function Personas() {
  return (
    <section aria-labelledby="personas-title" className="bg-canvas pt-8 pb-20 md:pt-12 md:pb-28">
      <div className="mx-auto max-w-[80rem] px-4 md:px-8">
        <SectionHeading
          id="personas-title"
          eyebrow="Who it is for"
          title={
            <>
              Built for the way small businesses <Accent>actually</Accent> work.
            </>
          }
        />

        <ul className="mt-12 grid gap-4 md:grid-cols-3 lg:mt-16">
          {personas.map((p, i) => (
            <Reveal as="li" key={p.name} delay={i * 110} className="flex flex-col rounded-xl border border-line bg-surface p-6">
              <div className="flex items-center gap-3">
                <Avatar name={p.name} size="lg" shape="square" tone="accent" />
                <div className="min-w-0">
                  <h3 className="text-body-md font-semibold text-fg">{p.name}</h3>
                  <p className="text-caption text-fg-muted">{p.who}</p>
                </div>
              </div>
              <p className="mt-5 text-body-sm text-fg">{p.need}</p>
              <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
                {p.uses.map((u) => (
                  <Badge key={u} tone="neutral" size="sm">
                    {u}
                  </Badge>
                ))}
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
