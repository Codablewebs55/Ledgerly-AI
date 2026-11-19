import type { CSSProperties } from 'react'
import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'
import { initials } from '../utils/format'

const palettes = [
  'bg-brand-subtle text-fg-brand',
  'bg-accent-subtle text-fg-accent',
  'bg-info-subtle text-fg-info',
  'bg-warning-subtle text-fg-warning',
  'bg-surface-sunken text-fg-muted',
]

const sizes = {
  sm: 'size-6 text-micro',
  md: 'size-8 text-caption',
  lg: 'size-10 text-label',
  xl: 'size-12 text-body-sm',
}


function paletteFor(name: string) {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return palettes[h % palettes.length]
}

export type AvatarProps = {
  name: string
  size?: keyof typeof sizes
  shape?: 'circle' | 'square'
  /** `accent` is the lime brand tile, e.g. the workspace in the side nav; `brand` is forest with lime initials, for
   *  use on a lime surface. Default tints by name. */
  tone?: 'auto' | 'accent' | 'brand'
  className?: string
  style?: CSSProperties
}

/**
 * Initials avatar for clients, vendors and teammates. The tint is derived
 * from the name, so the same client always gets the same colour.
 * The canvas for this component is at tempo/designs/design-system/data-display/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function Avatar({ name, size = 'md', shape = 'circle', tone = 'auto', className, style }: AvatarProps) {
  return (
    <span
      role="img"
      aria-label={name}
      style={style}
      className={cx(
        'inline-grid shrink-0 place-items-center font-semibold select-none',
        shape === 'circle' ? 'rounded-full' : 'rounded-md',
        sizes[size],
        tone === 'accent' ? 'bg-accent text-fg-on-accent' : tone === 'brand' ? 'bg-brand text-fg-inverse-accent' : paletteFor(name),
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}

defineControls(Avatar, {
  name: { type: 'text' },
  size: { type: 'select' },
  shape: { type: 'select' },
  tone: { type: 'select' },
})
