import { ArrowDownRight, ArrowUpRight, ChevronDown } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'
import type { IconComponent } from '../utils/types'
import { Card } from './Card'
import { Sparkline } from './Sparkline'

export type MetricDelta = {
  /** Percentage change, e.g. 8.2 or -3.1. */
  value: number
  label?: string
  /** For costs, a decrease is good. Defaults to true. */
  increaseIsGood?: boolean
}

export type MetricTagTone = 'info' | 'negative' | 'positive' | 'neutral'

const tagTones: Record<MetricTagTone, string> = {
  info: 'bg-info-subtle text-fg-info',
  negative: 'bg-negative-subtle text-fg-negative',
  positive: 'bg-positive-subtle text-fg-positive',
  neutral: 'bg-surface-sunken text-fg-muted',
}

/** Pill shared by the delta and the stat count so both read as the same chip. */
const pill = 'figure inline-flex w-fit items-center gap-0.5 rounded-xs px-1 py-0.5 text-caption font-semibold'

export type MetricPeriod = {
  /** Comparison windows, e.g. ['last month', 'last quarter', 'last year']. */
  options: string[]
  /** Controlled value; omit to let the card hold it (starts on the first option). */
  value?: string
  onChange?: (value: string) => void
}

export type MetricCardProps = {
  label: string
  /** Usually a <Money/>; any node works (counts, days). */
  value: ReactNode
  delta?: MetricDelta
  trend?: number[]
  icon?: IconComponent
  footnote?: ReactNode
  /** Bordered breakdown row under the figure: label on the left, tone-coloured count chip on the right,
   *  e.g. { label: 'Open invoices', value: 6, tone: 'info' }. The footnote becomes its caption. */
  stat?: { label: ReactNode; value: ReactNode; tone?: MetricTagTone }
  /** Comparison-period dropdown chip ("last month ⌄") in place of the comparison caption; replaces `delta.label`. */
  period?: MetricPeriod
  /** `hero` adds a 2px forest outline and a larger figure — one per view, for the headline KPI. */
  emphasis?: 'default' | 'hero'
  onClick?: () => void
  className?: string
}

/** Sunken chip that hugs the current label. A transparent native select sits on top, so the dropdown stays
 *  keyboard- and screen-reader-native without sizing the chip to its longest option. */
function PeriodChip({ options, value, onChange }: MetricPeriod) {
  const [local, setLocal] = useState(options[0])
  const current = value ?? local
  return (
    <span className="relative inline-flex h-7 w-fit items-center gap-1 rounded-md bg-surface-sunken pr-2 pl-2.5 text-label font-normal text-fg-muted transition-colors duration-(--duration-fast) has-[select:focus-visible]:outline-2 has-[select:focus-visible]:outline-offset-2 has-[select:focus-visible]:outline-line-focus hover:bg-surface-hover hover:text-fg">
      <span aria-hidden>{current}</span>
      <ChevronDown className="size-3.5 text-fg-subtle" aria-hidden />
      <select
        aria-label="Compare with"
        value={current}
        onChange={(e) => {
          setLocal(e.target.value)
          onChange?.(e.target.value)
        }}
        onClick={(e) => e.stopPropagation()}
        className="absolute inset-0 cursor-pointer appearance-none opacity-0 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </span>
  )
}

/**
 * KPI tile: label, then an edge-to-edge hairline, then figure, change and trend. The delta colour encodes good vs
 * bad (not up vs down), so a falling expense line reads green.
 * The canvas for this component is at tempo/designs/design-system/data-display/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function MetricCard({ label, value, delta, trend, icon: Icon, footnote, stat, period, emphasis = 'default', onClick, className }: MetricCardProps) {
  const hero = emphasis === 'hero'
  const good = delta ? (delta.value >= 0) === (delta.increaseIsGood ?? true) : true
  const DeltaIcon = delta && delta.value < 0 ? ArrowDownRight : ArrowUpRight

  return (
    <Card
      tone={hero ? 'emphasis' : 'default'}
      padding="none"
      interactive={!!onClick}
      onClick={onClick}
      // The header band is tighter than the body: 16px above the label row instead of the card's usual 20/24px.
      className={cx('flex flex-col gap-4 px-5 pt-4 pb-5 md:px-6 md:pb-6', className)}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-label text-fg-muted">{label}</p>
        {Icon && (
          <span className="grid size-8 place-items-center rounded-md bg-surface-sunken">
            <Icon className="size-4 text-fg-icon" aria-hidden />
          </span>
        )}
      </div>

      {/* Full-bleed rule separating the label row from the figure; bleeds through the Card's md padding.
          The header band is tighter than the body: 16px above the label row, 12px below it. */}
      <span aria-hidden className="-mx-5 -mt-1 block h-px bg-line-subtle md:-mx-6" />

      <div className={cx('figure', hero ? 'text-figure-xl' : 'text-figure-lg')}>{value}</div>

      {stat && (
        <div className="mt-auto flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3 rounded-md border border-line px-2.5 py-2">
            <span className="truncate text-body-sm font-medium text-fg">{stat.label}</span>
            <span className={cx(pill, 'px-1.5 text-label', tagTones[stat.tone ?? 'neutral'])}>{stat.value}</span>
          </div>
          {period ? <PeriodChip {...period} /> : footnote && <span className="text-caption text-fg-subtle">{footnote}</span>}
        </div>
      )}

      {!stat && (delta || trend || footnote || period) && (
        <div className="mt-auto flex items-end justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            {/* The delta pill sits on its own line, 8px (gap-1 + mb-1) above its caption. */}
            {delta && (
              <span className={cx(pill, 'mb-1', good ? 'bg-positive-subtle text-fg-positive' : 'bg-negative-subtle text-fg-negative')}>
                <DeltaIcon className="size-3" aria-hidden />
                {Math.abs(delta.value).toFixed(1)}%
                <span className="sr-only">{delta.value < 0 ? 'decrease' : 'increase'}</span>
              </span>
            )}
            {period ? <PeriodChip {...period} /> : delta?.label && <span className="text-caption text-fg-subtle">{delta.label}</span>}
            {footnote && <span className="text-caption text-fg-subtle">{footnote}</span>}
          </div>
          {trend && <Sparkline values={trend} tone={good ? 'brand' : 'negative'} className="h-9 w-24 shrink-0" />}
        </div>
      )}
    </Card>
  )
}

defineControls(MetricCard, {
  label: { type: 'text' },
  emphasis: { type: 'select' },
  delta: { type: 'object' },
  trend: { type: 'object' },
  footnote: { type: 'text' },
  stat: { type: 'object' },
  period: { type: 'object' },
  value: false,
  icon: false,
  onClick: false,
})
