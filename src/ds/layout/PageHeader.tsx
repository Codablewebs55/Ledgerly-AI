import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'

export type PageHeaderProps = {
  title: ReactNode
  description?: ReactNode
  /** Back link for detail and create pages. */
  back?: { label: string; to: string }
  /** Inline after the title — usually a StatusBadge. */
  meta?: ReactNode
  actions?: ReactNode
  className?: string
}

/**
 * Top of every app page: title, context and the page's actions. Actions
 * wrap under the title on mobile instead of shrinking.
 * The canvas for this component is at tempo/designs/design-system/navigation/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function PageHeader({ title, description, back, meta, actions, className }: PageHeaderProps) {
  return (
    <header className={cx('flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}>
      <div className="min-w-0">
        {back && (
          <Link to={back.to} className="mb-3 inline-flex items-center gap-1.5 rounded-xs text-label text-fg-muted transition-colors hover:text-fg">
            <ArrowLeft className="size-3.5" aria-hidden />
            {back.label}
          </Link>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-heading-lg md:text-heading-xl">{title}</h1>
          {meta}
        </div>
        {description && <p className="mt-1.5 max-w-2xl text-body-sm text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex h-max shrink-0 flex-wrap items-center gap-2 md:gap-3">{actions}</div>}
    </header>
  )
}

defineControls(PageHeader, {
  title: { type: 'text' },
  description: { type: 'text' },
  back: { type: 'object' },
  meta: false,
  actions: false,
})
