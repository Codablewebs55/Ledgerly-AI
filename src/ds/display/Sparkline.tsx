import { useId } from 'react'
import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'

export type SparklineTone = 'brand' | 'positive' | 'negative' | 'inverse'

const tones: Record<SparklineTone, string> = {
  brand: 'text-chart-1',
  positive: 'text-chart-positive',
  negative: 'text-chart-negative',
  inverse: 'text-fg-inverse-accent',
}

export type SparklineProps = {
  values: number[]
  tone?: SparklineTone
  /** Soft area fill under the line. */
  area?: boolean
  className?: string
}

/**
 * Word-sized trend line. Decorative: always pair it with the number it
 * summarises (it is aria-hidden).
 * The canvas for this component is at tempo/designs/design-system/data-display/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function Sparkline({ values, tone = 'brand', area = true, className }: SparklineProps) {
  const gradientId = useId()
  const w = 100
  const h = 32
  const pad = 3
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pts = values.map((v, i) => [(i / Math.max(values.length - 1, 1)) * w, pad + (1 - (v - min) / span) * (h - pad * 2)] as const)
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
  const [lx, ly] = pts[pts.length - 1] ?? [0, 0]

  return (
    // Draws in left to right on mount; under reduced motion it is simply there
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={cx('h-8 w-24 animate-line-draw overflow-visible motion-reduce:animate-none', tones[tone], className)} aria-hidden>
      {area && (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${line} L${w},${h} L0,${h} Z`} fill={`url(#${gradientId})`} />
        </>
      )}
      <path d={line} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={lx} cy={ly} r="2.25" fill="currentColor" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

defineControls(Sparkline, {
  values: { type: 'object' },
  tone: { type: 'select' },
  area: { type: 'boolean' },
})
