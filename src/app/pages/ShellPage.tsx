import { Compass, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button, Card, EmptyState, PageHeader, Skeleton } from '@/ds'
import { useAssistant } from '../shell/assistant-context'
import type { PageDef } from './shell-pages'

// Stage 4A: every route renders inside the real shell with its page header
// and a layout skeleton, so navigation and responsiveness can be reviewed
// before the screens themselves are built.

export function ShellPage({ title, description, icon, stage, back, layout = 'list' }: PageDef) {
  const assistant = useAssistant()
  return (
    <div className="flex flex-col gap-(--ldg-section-gap)">
      <PageHeader
        title={title}
        description={description}
        back={back}
      />
      <LayoutSkeleton layout={layout} />
      <Card padding="none">
        <EmptyState
          icon={icon}
          title={`${title} is designed in Stage ${stage}`}
          description="The app shell, navigation and responsive layout are in place. This screen's content comes next."
          actions={
            <Button variant="secondary" icon={Sparkles} onClick={assistant.open}>
              Ask Ledgerly AI
            </Button>
          }
        />
      </Card>
    </div>
  )
}

/** Grey layout blocks that show how the content area flows at each width. */
function LayoutSkeleton({ layout }: { layout: NonNullable<PageDef['layout']> }) {
  if (layout === 'metrics') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonCard key={i}>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-7 w-32" />
            <Skeleton className="mt-4 h-8 w-full" />
          </SkeletonCard>
        ))}
      </div>
    )
  }
  if (layout === 'form') {
    return (
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <SkeletonCard>
          {[0, 1, 2].map((i) => (
            <div key={i} className="mb-5 grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </SkeletonCard>
        <SkeletonCard>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-7 w-36" />
          <Skeleton className="mt-6 h-10 w-full" />
        </SkeletonCard>
      </div>
    )
  }
  return (
    <SkeletonCard>
      <div className="mb-5 flex flex-wrap gap-3">
        <Skeleton className="h-10 w-full sm:w-64" />
        <Skeleton className="h-10 w-28" />
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 border-t border-line-subtle py-4">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="hidden h-3 w-24 md:block" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </SkeletonCard>
  )
}

function SkeletonCard({ children }: { children: ReactNode }) {
  return (
    <div aria-hidden>
      <Card padding="md">{children}</Card>
    </div>
  )
}

export function NotFoundPage() {
  return (
    <Card padding="none">
      <EmptyState
        icon={Compass}
        title="We couldn't find that page"
        description="It may have moved, or the link is out of date."
        actions={<Button to="/app">Back to Overview</Button>}
      />
    </Card>
  )
}
