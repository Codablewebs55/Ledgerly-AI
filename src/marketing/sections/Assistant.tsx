import { Sparkles } from 'lucide-react'
import { Accent, Reveal, SectionHeading, Shot } from '../parts'
import { stills } from '../stills'

// Taken word for word from the insights Ledgerly AI shows on the sample workspace's Overview
const insights = [
  { title: 'Harbor & Pine Co. is 21 days late', body: 'They usually pay about 11 days late — a friendly nudge now tends to land payment within a week.' },
  { title: 'October was your strongest month', body: 'Money in reached $36,120, up 8% on September, while spending grew more slowly.' },
  { title: 'Set aside about $6,000 for Q4 tax', body: 'Based on profit so far this quarter at your 25% estimated rate.' },
]

/** Ledgerly AI on the forest band: what it notices, and the panel where you ask it about your books. */
export function Assistant() {
  return (
    <section id="assistant" aria-labelledby="assistant-title" className="scroll-mt-20 overflow-x-clip bg-inverse py-20 text-fg-inverse md:py-28">
      <div className="mx-auto max-w-[80rem] px-4 md:px-8">
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
          intro="Ledgerly AI reads what is already in your workspace and points out what is worth a look: a client paying late, your strongest month, what to set aside for tax. Ask it a question and it starts from the page you are on."
        />

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:items-center">
          <ol className="flex flex-col gap-4 lg:col-span-5 lg:self-start">
            {insights.map((it, i) => (
              <Reveal as="li" key={it.title} delay={i * 120} className="rounded-xl border border-line-inverse bg-inverse-raised p-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-md bg-accent text-fg-on-accent">
                    <Sparkles className="size-4" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-body-md font-semibold text-fg-inverse">{it.title}</h3>
                    <p className="mt-1 text-body-sm text-fg-inverse-muted">{it.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal className="relative lg:col-span-7" delay={150}>
            {/* Column widths follow each still's width-to-height ratio (365/494 and 416/900), so both render at exactly the same height uncropped */}
            <div className="grid grid-cols-[739fr_462fr] gap-4 rounded-2xl border border-line-inverse bg-inverse-raised p-4 sm:gap-6 sm:p-6">
              <Shot
                still={stills.aiCard}
                alt="Ledgerly AI card on the Overview listing three things worth a look today, with links to draft a reminder, see what drove October and show the tax maths."
                className="border-line-inverse"
              />
              <Shot
                still={stills.aiPanel}
                alt="The Ledgerly AI panel, looking at the Overview, with suggested questions: summarise my cash flow this month, which invoices need attention, and how much should I set aside for tax."
                className="border-line-inverse"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
