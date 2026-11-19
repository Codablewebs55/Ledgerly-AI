import { Lightbulb } from 'lucide-react'
import type { ReactNode } from 'react'
import { cx } from '@/ds/utils/cx'

// Documentation chrome for /design-system and the design-system canvases.
// Presentational scaffolding for docs only — product screens never use these.

export function DocSection({ id, title, intro, children }: { id: string; title: string; intro: ReactNode; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <div className="mb-6 max-w-2xl">
        <h2 id={`${id}-title`} className="text-heading-xl">
          {title}
        </h2>
        <p className="mt-2 text-body-md leading-(--text-heading-sm--line-height) text-fg-muted">{intro}</p>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

/**
 * Guideline row: guidance + live specimen. `split` puts them side by side on
 * wide screens; `stack` gives wide specimens (tables, metric grids) the full
 * width under the guidance.
 */
export function DocRow({
  name,
  description,
  children,
  layout = 'split',
  className,
}: {
  name: string
  description: ReactNode
  children: ReactNode
  layout?: 'split' | 'stack'
  className?: string
}) {
  return (
    <div
      className={cx(
        'grid min-w-0 gap-5 rounded-lg border border-line bg-surface p-5 md:p-6',
        layout === 'split' && 'xl:grid-cols-[14rem_1fr] xl:gap-10',
      )}
    >
      <div className={cx('flex flex-col gap-1.5', layout === 'stack' && 'max-w-2xl')}>
        <h3 className="text-heading-sm">{name}</h3>
        <p className="text-body-sm text-fg-muted">{description}</p>
      </div>
      <div className={cx('flex min-w-0 flex-col gap-5', className)}>{children}</div>
    </div>
  )
}

/** One labelled line of specimens inside a DocRow. */
export function Demo({ label, children, className }: { label?: string; children: ReactNode; className?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
      {label && <span className="w-24 shrink-0 text-caption text-fg-subtle">{label}</span>}
      <div className={cx('flex min-w-0 flex-wrap items-center gap-3', className)}>{children}</div>
    </div>
  )
}

export function Code({ children }: { children: ReactNode }) {
  return <code className="rounded-xs bg-surface-sunken px-1.5 py-0.5 font-mono text-caption break-all text-fg-muted">{children}</code>
}

/** Design-decision callout — the "why" behind a family, for the case study. */
export function Decision({ children }: { children: ReactNode }) {
  return (
    <aside className="flex gap-3 rounded-lg border border-line-subtle bg-surface-sunken p-4">
      <Lightbulb className="mt-0.5 size-4 shrink-0 text-fg-brand" aria-hidden />
      <div className="text-body-sm text-fg-muted">
        <span className="font-semibold text-fg">Design decision. </span>
        {children}
      </div>
    </aside>
  )
}

/** Fixed-size frame for showing a component in context (phone, sidebar). */
export function Frame({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <div className={cx('relative overflow-hidden rounded-lg border border-line bg-canvas', className)}>{children}</div>
      {label && <figcaption className="text-caption text-fg-subtle">{label}</figcaption>}
    </figure>
  )
}
