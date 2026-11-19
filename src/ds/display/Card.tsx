import type { MouseEventHandler, ReactNode } from 'react'
import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'
import type { IconComponent } from '../utils/types'

export type CardTone = 'default' | 'sunken' | 'inverse' | 'inverse-raised' | 'insight' | 'emphasis'
export type CardRadius = 'lg' | 'xl' | '2xl'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

const tones: Record<CardTone, string> = {
  default: 'border border-line bg-surface text-fg',
  sunken: 'border border-line-subtle bg-surface-sunken text-fg',
  inverse: 'bg-inverse text-fg-inverse',
  insight: 'border border-line bg-accent-subtle text-fg',
  /** A card placed on an inverse band, e.g. marketing quotes and AI steps on forest. */
  'inverse-raised': 'border border-line-inverse bg-inverse-raised text-fg-inverse',
  /** The one highlighted card in a set, e.g. the hero metric: a 2px brand border. */
  emphasis: 'border-2 border-line-brand bg-surface text-fg',
}

// lg is the app card; xl and 2xl are the larger marketing card and product-frame radii.
const radii: Record<CardRadius, string> = { lg: 'rounded-lg', xl: 'rounded-xl', '2xl': 'rounded-2xl' }

const paddings: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5 md:p-6',
  lg: 'p-6 md:p-8',
}

export type CardProps = {
  children: ReactNode
  tone?: CardTone
  padding?: CardPadding
  radius?: CardRadius
  /** Adds hover lift — only when the whole card is a click target. */
  interactive?: boolean
  as?: 'div' | 'section' | 'article' | 'aside' | 'figure' | 'li'
  onClick?: MouseEventHandler<HTMLElement>
  id?: string
  'aria-labelledby'?: string
  className?: string
}

/**
 * The base surface for grouped content. `insight` is reserved for AI
 * assistant output; `inverse` for one hero metric per view.
 * The canvas for this component is at tempo/designs/design-system/data-display/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function Card({ children, tone = 'default', padding = 'md', radius = 'lg', interactive, as: Tag = 'div', onClick, id, className, ...aria }: CardProps) {
  return (
    <Tag
      id={id}
      onClick={onClick}
      aria-labelledby={aria['aria-labelledby']}
      className={cx(
        'min-w-0',
        radii[radius],
        tones[tone],
        paddings[padding],
        interactive &&
          'cursor-pointer transition-[border-color,transform] duration-(--duration-fast) ease-standard hover:-translate-y-px hover:border-line-strong',
        className,
      )}
    >
      {children}
    </Tag>
  )
}

export type CardHeaderProps = {
  title: ReactNode
  description?: ReactNode
  icon?: IconComponent
  action?: ReactNode
  /** Heading id, for `aria-labelledby` on the Card. */
  id?: string
  /**
   * `band` bleeds the header to the card edges on a bg-accent-muted strip with a
   * forest icon tile. Insight cards only, on the default `md` padding.
   */
  variant?: 'plain' | 'band'
  /** Plain only: a subtle line-subtle rule under the header. On `padding="none"` cards the header carries
   *  its own px, so the rule runs edge to edge (e.g. Needs attention). */
  divider?: boolean
  /** Plain only: for a `padding="none"` card (e.g. one holding an embedded Table) — the header carries the card's
   *  padding itself and sits flush on the content below. */
  inset?: boolean
  className?: string
}

/** Title row for a Card: heading, optional description, trailing action. */
export function CardHeader({ title, description, icon: Icon, action, id, variant = 'plain', divider = false, inset = false, className }: CardHeaderProps) {
  if (variant === 'band') {
    return (
      <div className={cx('-mx-5 -mt-5 mb-4 flex items-center justify-between gap-4 rounded-t-[inherit] bg-accent-muted px-5 py-3 md:-mx-6 md:-mt-6 md:px-6', className)}>
        <div className="flex min-w-0 items-center gap-3">
          {Icon && (
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-brand text-fg-inverse-accent">
              <Icon className="size-5" aria-hidden />
            </span>
          )}
          <div className="min-w-0">
            <h3 id={id} className="text-heading-sm">
              {title}
            </h3>
            {description && <p className="text-caption text-fg-muted">{description}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    )
  }
  return (
    // Divider headers sit 4px above the content: list rows below bring their own 12px padding,
    // so the first row's content lands 16px under the rule, matching the 16px above it.
    <div className={cx('flex items-start justify-between gap-4', inset ? 'px-5 pt-5 pb-3 md:px-6' : divider ? 'mb-1 border-b border-line-subtle pb-4' : 'mb-4', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-surface-sunken text-fg-muted">
            <Icon className="size-4" aria-hidden />
          </span>
        )}
        <div className="min-w-0">
          <h3 id={id} className="text-heading-sm">
            {title}
          </h3>
          {description && <p className="mt-0.5 text-caption text-fg-subtle">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

defineControls(CardHeader, {
  title: { type: 'text' },
  description: { type: 'text' },
  variant: { type: 'select', options: ['plain', 'band'] },
  divider: { type: 'boolean' },
  inset: { type: 'boolean' },
  icon: false,
  action: false,
}); // ← keep: Tempo's HMR wrapper chains consecutive defineControls calls without ASI

defineControls(Card, {
  tone: { type: 'select' },
  padding: { type: 'select' },
  radius: { type: 'select' },
  interactive: { type: 'boolean' },
  as: { type: 'select' },
  onClick: false,
})
