import type { CSSProperties } from 'react'
import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'
import type { IconComponent } from '../utils/types'

export type IconTileTone = 'neutral' | 'positive' | 'negative' | 'brand'

const tones: Record<IconTileTone, string> = {
  neutral: 'bg-surface-sunken text-fg-icon',
  positive: 'bg-positive-subtle text-fg-positive',
  negative: 'bg-negative-subtle text-fg-negative',
  brand: 'bg-brand-subtle text-fg-brand',
}

export type IconTileProps = {
  icon: IconComponent
  /** Tint of the tile and its icon. `positive`/`negative` mark money flowing in/out. */
  tone?: IconTileTone
  className?: string
  style?: CSSProperties
}

/**
 * Small rounded square holding a decorative icon in a status tint, set beside a label
 * (e.g. "Money in" with a green tile, "Money out" with a red tile).
 * The canvas for this component is at tempo/designs/design-system/data-display/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function IconTile({ icon: Icon, tone = 'neutral', className, style }: IconTileProps) {
  return (
    <span aria-hidden className={cx('grid size-7 shrink-0 place-items-center rounded-md', tones[tone], className)} style={style}>
      {/* Icon inherits the tone's text colour: green for positive, red for negative, fg-icon for neutral. */}
      <Icon className="size-4" />
    </span>
  )
}

defineControls(IconTile, {
  tone: { type: 'select' },
  icon: false,
  style: false,
})
