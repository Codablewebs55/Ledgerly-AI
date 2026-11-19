import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'
import { formatMoney, type MoneyFormatOptions } from '../utils/format'

export type MoneyProps = MoneyFormatOptions & {
  amount: number
  /**
   * `auto` colours negatives red (and positives green when `signed`);
   * `inherit` keeps the surrounding text colour.
   */
  tone?: 'auto' | 'inherit' | 'muted'
  className?: string
}

/**
 * Every currency amount in the product. Always tabular, always the same
 * sign convention — never format money inline.
 * The canvas for this component is at tempo/designs/design-system/data-display/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function Money({ amount, tone = 'auto', className, ...format }: MoneyProps) {
  const toneClass =
    tone === 'muted'
      ? 'text-fg-muted'
      : tone === 'auto' && amount < 0
        ? 'text-fg-negative'
        : tone === 'auto' && format.signed && amount > 0
          ? 'text-fg-positive'
          : undefined
  return <span className={cx('figure whitespace-nowrap', toneClass, className)}>{formatMoney(amount, format)}</span>
}

defineControls(Money, {
  amount: { type: 'number' },
  currency: { type: 'select', options: ['USD', 'EUR', 'GBP', 'CAD'] },
  signed: { type: 'boolean' },
  compact: { type: 'boolean' },
  wholeUnits: { type: 'boolean' },
  tone: { type: 'select' },
})
