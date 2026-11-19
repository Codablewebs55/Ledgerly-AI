import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'
import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'
import type { IconComponent } from '../utils/types'

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger' | 'inverse'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold transition-[background-color,border-color,color,transform] duration-(--duration-fast) ease-standard active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100'

// Weight ladder: primary (one per view) → accent (the single key CTA on
// marketing / AI moments) → secondary → ghost. danger recolours destructive
// confirmations; inverse is for dark (bg-inverse / bg-brand) surfaces.
const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-fg-on-brand hover:bg-brand-hover active:bg-brand-active disabled:bg-surface-sunken disabled:text-fg-disabled',
  accent:
    'bg-accent text-fg-on-accent hover:bg-accent-hover disabled:bg-surface-sunken disabled:text-fg-disabled',
  secondary:
    'border border-line-control bg-surface text-fg hover:border-line-input hover:bg-surface-hover disabled:border-line-control disabled:bg-surface disabled:text-fg-disabled',
  ghost: 'text-fg-muted hover:bg-surface-hover hover:text-fg disabled:bg-transparent disabled:text-fg-disabled',
  danger:
    'bg-negative text-fg-on-brand hover:brightness-90 disabled:bg-surface-sunken disabled:text-fg-disabled',
  inverse:
    'border border-line-inverse text-fg-inverse hover:bg-inverse-raised focus-visible:outline-line-focus-inverse disabled:text-fg-inverse-muted',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 text-label',
  md: 'h-10 text-body-sm',
  lg: 'h-12 text-body-md',
}

// Padding and icon-only widths are mutually exclusive: both set padding, and
// whichever Tailwind emits last would win, so only one is ever applied.
const paddings: Record<ButtonSize, string> = { sm: 'px-3', md: 'px-4', lg: 'px-5' }
const iconOnlySizes: Record<ButtonSize, string> = { sm: 'w-8', md: 'w-10', lg: 'w-12' }

const iconSizes: Record<ButtonSize, string> = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-4.5',
}

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  children?: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  /** Icon component (e.g. lucide `Plus`). Icon-only buttons need `aria-label`. */
  icon?: IconComponent
  iconPosition?: 'start' | 'end'
  loading?: boolean
  fullWidth?: boolean
  /** Renders a router link with button styling (navigation, not actions). */
  to?: string
}

/**
 * Ledgerly's action primitive.
 * The canvas for this component is at tempo/designs/design-system/actions/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'start',
  loading = false,
  fullWidth = false,
  to,
  className,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const iconOnly = !children && (Icon || loading)
  const classes = cx(
    base,
    variants[variant],
    sizes[size],
    iconOnly ? iconOnlySizes[size] : paddings[size],
    fullWidth && 'w-full',
    className,
  )
  const glyph = loading ? (
    <Loader2 className={cx(iconSizes[size], 'motion-safe:animate-spin')} aria-hidden />
  ) : Icon ? (
    <Icon className={iconSizes[size]} aria-hidden />
  ) : null

  const content = (
    <>
      {iconPosition === 'start' && glyph}
      {children}
      {iconPosition === 'end' && glyph}
    </>
  )

  if (to && !disabled) {
    return (
      <Link to={to} className={classes} aria-label={rest['aria-label']} onClick={rest.onClick as never}>
        {content}
      </Link>
    )
  }

  return (
    // Loading keeps the variant colour (it isn't disabled, just busy) but
    // ignores further clicks.
    <button
      type={type}
      className={cx(classes, loading && 'pointer-events-none')}
      disabled={disabled}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      {...rest}
    >
      {content}
    </button>
  )
}

defineControls(Button, {
  children: { type: 'text' },
  variant: { type: 'select' },
  size: { type: 'select' },
  iconPosition: { type: 'select' },
  loading: { type: 'boolean' },
  disabled: { type: 'boolean' },
  fullWidth: { type: 'boolean' },
  to: { type: 'text' },
  icon: false,
  onClick: false,
})
