import type { CSSProperties, ReactNode } from 'react'
import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'
import type { IconComponent } from '../utils/types'

export type BadgeTone = 'neutral' | 'brand' | 'accent' | 'positive' | 'negative' | 'warning' | 'draft' | 'info' | 'inverse'

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-surface-sunken text-fg-muted',
  brand: 'bg-brand-subtle text-fg-brand',
  accent: 'bg-accent-subtle text-fg-accent',
  positive: 'bg-positive-subtle text-fg-positive',
  negative: 'bg-negative-subtle text-fg-negative',
  warning: 'bg-warning-subtle text-fg-warning',
  /** Unsent work: amber-100 tint, a step stronger than warning. */
  draft: 'bg-draft-subtle text-fg-draft',
  info: 'bg-info-subtle text-fg-info',
  /** On the forest rail and other bg-inverse surfaces. */
  inverse: 'bg-inverse-chip text-fg-inverse-muted',
}

const dots: Record<BadgeTone, string> = {
  neutral: 'bg-fg-subtle',
  brand: 'bg-fg-brand',
  accent: 'bg-fg-accent',
  positive: 'bg-fg-positive',
  negative: 'bg-fg-negative',
  warning: 'bg-fg-warning',
  draft: 'bg-draft',
  info: 'bg-fg-info',
  inverse: 'bg-fg-inverse-muted',
}

const sizes = { sm: 'h-5 px-1.5 text-caption gap-1', md: 'h-6 px-2 text-label gap-1.5' }

export type BadgeProps = {
  children: ReactNode
  tone?: BadgeTone
  size?: 'sm' | 'md'
  dot?: boolean
  icon?: IconComponent
  className?: string
  style?: CSSProperties
}

/**
 * Compact label for a status, category or count. Colour is never the only
 * signal — the text always carries the meaning.
 * The canvas for this component is at tempo/designs/design-system/data-display/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function Badge({ children, tone = 'neutral', size = 'md', dot, icon: Icon, className, style }: BadgeProps) {
  return (
    <span style={{ fontWeight: "var(--font-weight-regular)", backgroundColor: "var(--ldg-fg-inverse-accent)", color: "var(--ldg-bg-brand)", ...style }} className={cx('inline-flex w-fit shrink-0 items-center rounded-full font-medium whitespace-nowrap', tones[tone], sizes[size], className)}>
      {dot && <span className={cx('size-1.5 rounded-full', dots[tone])} aria-hidden />}
      {Icon && <Icon className="size-3.5" aria-hidden />}
      {children}
    </span>
  )
}

defineControls(Badge, {
  children: { type: 'text' },
  tone: { type: 'select' },
  size: { type: 'select' },
  dot: { type: 'boolean' },
  icon: false,
})
