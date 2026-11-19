import type { ReactNode } from 'react'
import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'
import type { IconComponent } from '../utils/types'

export type EmptyStateProps = {
  icon?: IconComponent
  title: string
  description?: ReactNode
  /** One primary next step; optionally a secondary. */
  actions?: ReactNode
  size?: 'sm' | 'md'
  className?: string
}

/**
 * What to show when a list has nothing in it — always explains why and
 * offers the next step, never a bare "No data".
 * The canvas for this component is at tempo/designs/design-system/feedback/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function EmptyState({ icon: Icon, title, description, actions, size = 'md', className }: EmptyStateProps) {
  return (
    <div className={cx('flex flex-col items-center text-center', size === 'md' ? 'px-6 py-14' : 'px-4 py-8', className)}>
      {Icon && (
        <span className={cx('grid place-items-center rounded-xl bg-brand-subtle text-fg-brand', size === 'md' ? 'mb-5 size-12' : 'mb-3 size-10')}>
          <Icon className={size === 'md' ? 'size-6' : 'size-5'} aria-hidden />
        </span>
      )}
      <p className="font-display text-heading-sm">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-body-sm text-fg-muted">{description}</p>}
      {actions && <div className="mt-5 flex flex-wrap justify-center gap-3">{actions}</div>}
    </div>
  )
}

defineControls(EmptyState, {
  title: { type: 'text' },
  description: { type: 'text' },
  size: { type: 'select' },
  icon: false,
  actions: false,
})
