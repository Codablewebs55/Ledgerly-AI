import { Sparkles } from 'lucide-react'
import { Card } from '@/ds'
import { Accent, Reveal, SectionHeading, Shot } from '../parts'
import { stills } from '../stills'

// Drawn from the prompts Ledgerly AI suggests on the Invoices, Expenses and Reports pages (src/app/shell/assistant-context.ts)
const insights = [
  { title: 'Chase late payments', body: 'Drafts reminders for overdue invoices and spots which clients usually pay late.' },
  { title: 'Keep expenses tidy', body: 'Finds possible duplicate receipts and expenses that are missing a category.' },
  { title: 'Read your reports in plain English', body: 'Explains your profit and loss and compares this quarter with the last.' },
]

/** Ledgerly AI on the forest band: what it notices, and the panel where you ask it about your books. */
export function Assistant() {
  return (
    <section id="assistant" aria-labelledby="assistant-title" className="scroll-mt-20 overflow-x-clip bg-inverse py-20 text-fg-inverse md:py-28">
      <div className="mx-auto max-w-(--ldg-content-max) px-4 md:px-8">
        <SectionHeading
          id="assistant-title"
          inverse
          eyebrow="Ledgerly AI"
          title={
            <>
              Answers from your
              <br />
              <Accent inverse>own</Accent> books.
            </>
          }
        />

        {/* On large screens the intro sits in the right column, directly above the chat panel; the insight cards span both rows */}
        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:items-start lg:gap-y-6">
          <p className="max-w-(--ldg-prose-max) text-body-md text-fg-inverse-muted md:text-body-lg lg:col-span-7 lg:col-start-6 lg:row-start-1">
            Ledgerly AI spots what needs your attention, from late payers to tax set-asides, and answers questions about the page you're on.
          </p>

          <div className="flex flex-col gap-4 lg:col-span-5 lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <ol className="flex flex-col gap-4">
            {insights.map((it, i) => (
              <Reveal as="li" key={it.title} delay={i * 120}>
                <Card tone="inverse-raised" radius="xl" padding="none" className="h-full p-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-md bg-accent text-fg-on-accent">
                    <Sparkles className="size-4" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-body-md font-semibold text-fg-inverse">{it.title}</h3>
                    <p className="mt-1 text-body-sm text-fg-inverse-muted">{it.body}</p>
                  </div>
                </div>
              </Card>
</Reveal>
            ))}
          </ol>
          <Reveal delay={360}>
            <Card tone="inverse-raised" radius="xl" padding="sm">
            <Shot
              still={stills.aiCard}
              alt="Ledgerly AI card on the Overview listing three things worth a look today, with links to draft a reminder, see what drove October and show the tax maths."
              className="border-line-inverse"
            />
          </Card>
</Reveal>
          </div>

          <Reveal className="relative lg:col-span-7 lg:col-start-6 lg:row-start-2" delay={150}>
            {/* The panel without its empty middle: the header and suggestions (top 376 of the still's 900 rows) laid over the chat input (bottom 121 rows) */}
            <Card tone="inverse-raised" radius="2xl" padding="none" className="p-4 sm:p-6">
              <div className="relative">
                <Shot
                  still={stills.aiPanel}
                  alt="The Ledgerly AI panel, looking at the Overview, with suggested questions: summarise my cash flow this month, which invoices need attention, and how much should I set aside for tax. Below them, the chat input."
                  className="aspect-[416/497] border-line-inverse"
                  imgClassName="h-full object-cover object-bottom"
                />
                <div aria-hidden className="absolute inset-x-px top-px aspect-[416/376] overflow-hidden rounded-t-[7px]">
                  <img src={stills.aiPanel.src} width={stills.aiPanel.w} height={stills.aiPanel.h} alt="" loading="lazy" decoding="async" className="block w-full" />
                </div>
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
