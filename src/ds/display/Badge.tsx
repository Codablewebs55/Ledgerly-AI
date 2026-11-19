import type { ReactNode } from 'react'
import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'
import type { IconComponent } from '../utils/types'

export type BadgeTone = 'neutral' | 'brand' | 'accent' | 'positive' | 'negative' | 'warning' | 'draft' | 'info' | 'muted' | 'inverse' | 'inverse-accent'

const tones: Record<BadgeTone, string> = {
  /** The default label pill: subtle lime fill with forest text. */
  neutral: 'bg-accent-subtle text-fg-brand',
  brand: 'bg-brand-subtle text-fg-brand',
  accent: 'bg-accent-subtle text-fg-accent',
  positive: 'bg-positive-subtle text-fg-positive',
  negative: 'bg-negative-subtle text-fg-negative',
  warning: 'bg-warning-subtle text-fg-warning',
  /** Unsent work: amber-100 tint, a step stronger than warning. */
  draft: 'bg-draft-subtle text-fg-draft',
  info: 'bg-info-subtle text-fg-info',
  /** Quiet context on a white card, e.g. the period notes under the Invoices summary figures: sunken sand fill, default text. */
  muted: 'bg-surface-sunken text-fg',
  /** On the forest rail and other bg-inverse surfaces. */
  inverse: 'bg-inverse-chip text-fg-inverse-muted',
  /** Outlined lime on dark surfaces, e.g. the Recommended plan on the forest pricing card. */
  'inverse-accent': 'bg-transparent text-fg-inverse-accent outline -outline-offset-1 outline-line-inverse-accent',
}

const dots: Record<BadgeTone, string> = {
  neutral: 'bg-fg-brand',
  brand: 'bg-fg-brand',
  accent: 'bg-fg-accent',
  positive: 'bg-fg-positive',
  negative: 'bg-fg-negative',
  warning: 'bg-fg-warning',
  draft: 'bg-draft',
  info: 'bg-fg-info',
  muted: 'bg-fg-muted',
  inverse: 'bg-fg-inverse-muted',
  'inverse-accent': 'bg-fg-inverse-accent',
}

const sizes = { sm: 'h-5 px-1.5 text-caption gap-1', md: 'h-6 px-2 text-label gap-1.5' }

export type BadgeProps = {
  children: ReactNode
  tone?: BadgeTone
  size?: 'sm' | 'md'
  dot?: boolean
  icon?: IconComponent
  className?: string
}

/**
 * Compact label for a status, category or count. Colour is never the only
 * signal — the text always carries the meaning. Every tone is a token pair;
 * there is no style override, so a badge always matches its documented tone.
 * The canvas for this component is at tempo/designs/design-system/data-display/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function Badge({ children, tone = 'neutral', size = 'md', dot, icon: Icon, className }: BadgeProps) {
  return (
    <span className={cx('inline-flex w-fit shrink-0 items-center rounded-full font-regular whitespace-nowrap', tones[tone], sizes[size], className)}>
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
