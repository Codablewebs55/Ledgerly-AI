import { Plus } from 'lucide-react'
import { Accent, SectionHeading } from '../parts'

const faqs = [
  {
    q: 'What happens when I click “Get started for free”?',
    a: 'You land in a demo workspace for a sample business, Dafe Studio, filled with invoices, clients and cash flow. There is no sign-up and no card. Anything you change stays in your browser.',
  },
  {
    q: 'Who is Ledgerly for?',
    a: 'Freelancers, studios and small businesses who want invoicing, spending, bank activity and reporting in one place, without needing an accountant to read it.',
  },
  {
    q: 'Does Ledgerly connect to my bank?',
    a: 'In this demo, bank activity is sample data, so you can see how matching transactions works without connecting anything.',
  },
  {
    q: 'How does Ledgerly AI use my information?',
    a: 'It works from what is already in your workspace, which in the demo is sample data. It can make mistakes, so check important figures before acting on them.',
  },
  {
    q: 'Can I send real invoices from the demo?',
    a: 'No. Sending, reminders and payments are simulated in the demo. Nothing leaves your browser and no one is emailed.',
  },
  {
    q: 'Can I change plans later?',
    a: 'Yes. Plans are designed to move with you, up or down, whenever your business changes.',
  },
]

/** Plain-language answers, as native disclosure widgets (keyboard and screen reader friendly with no script). */
export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 border-t border-line bg-canvas py-20 md:py-28">
      <div className="mx-auto grid max-w-(--ldg-content-max) gap-10 px-4 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading
            id="faq-title"
            align="start"
            title={
              <>
                Questions, <Accent>answered.</Accent>
              </>
            }
            intro="The short version of what Ledgerly is, and what this demo does and does not do."
          />
        </div>
        <div className="divide-y divide-line border-y border-line lg:col-span-8">
          {faqs.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-body-md font-semibold text-fg focus-visible:outline-line-focus [&::-webkit-details-marker]:hidden">
                {f.q}
                <Plus className="size-5 shrink-0 text-fg-muted transition-transform duration-(--duration-base) ease-standard group-open:rotate-45" aria-hidden />
              </summary>
              <p className="max-w-[44rem] pb-6 text-body-md text-fg-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
