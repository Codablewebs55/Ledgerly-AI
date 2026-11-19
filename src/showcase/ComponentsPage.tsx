import ButtonsSection from './sections/ButtonsSection'
import FormsSection from './sections/FormsSection'
import CardsSection from './sections/CardsSection'
import TablesSection from './sections/TablesSection'
import NavigationSection from './sections/NavigationSection'
import BadgesSection from './sections/BadgesSection'
import FeedbackSection from './sections/FeedbackSection'
import StatesSection from './sections/StatesSection'

const toc = [
  { id: 'buttons', label: 'Buttons' },
  { id: 'forms', label: 'Inputs & forms' },
  { id: 'cards', label: 'Cards & metrics' },
  { id: 'tables', label: 'Tables' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'badges', label: 'Status badges' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'states', label: 'Component states' },
]

/** /design-system/components — every shared component, live. */
export default function ComponentsPage() {
  return (
    <div className="mx-auto max-w-(--ldg-content-max) px-(--ldg-page-gutter) py-10 md:py-14">
      <div className="max-w-3xl">
        <p className="text-label text-fg-brand">Components</p>
        <h1 className="mt-2 text-display-lg md:text-display-xl">Built once, used everywhere</h1>
        <p className="mt-4 text-body-lg text-fg-muted">
          Every screen in Ledgerly is assembled from these components and the foundation tokens. Each one documents its variants,
          states and the reasoning behind it.
        </p>
      </div>

      {/* Mobile / tablet jump list */}
      <nav aria-label="On this page" className="-mx-(--ldg-page-gutter) mt-8 flex gap-2 overflow-x-auto px-(--ldg-page-gutter) [scrollbar-width:none] lg:hidden">
        {toc.map((t) => (
          <a key={t.id} href={`#${t.id}`} className="shrink-0 rounded-full border border-line-control bg-surface px-3 py-1.5 text-label text-fg-muted hover:text-fg">
            {t.label}
          </a>
        ))}
      </nav>

      <div className="mt-10 grid gap-12 lg:grid-cols-[11rem_1fr] lg:gap-14">
        <nav aria-label="On this page" className="hidden lg:block">
          <ul className="sticky top-24 flex flex-col gap-1 border-l border-line">
            {toc.map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`} className="-ml-px block border-l border-transparent py-1.5 pl-4 text-body-sm text-fg-muted transition-colors hover:border-line-brand hover:text-fg">
                  {t.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex min-w-0 flex-col gap-16 md:gap-20">
          <ButtonsSection />
          <FormsSection />
          <CardsSection />
          <TablesSection />
          <NavigationSection />
          <BadgesSection />
          <FeedbackSection />
          <StatesSection />
        </div>
      </div>
    </div>
  )
}
