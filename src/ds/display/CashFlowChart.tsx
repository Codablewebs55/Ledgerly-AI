import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'
import { formatMoney } from '../utils/format'

export type CashFlowPoint = {
  /** Axis label, e.g. "Nov". */
  label: string
  moneyIn: number
  moneyOut: number
  /** Marks a period still in progress (month to date) with a hatched, lighter bar. */
  partial?: boolean
}

export type CashFlowChartProps = {
  data: CashFlowPoint[]
  currency?: string
  /** Accessible summary; the full series is also exposed as a visually hidden table. */
  'aria-label': string
  className?: string
}

const TICKS = 4

function niceMax(v: number) {
  if (v <= 0) return 1
  const mag = 10 ** Math.floor(Math.log10(v))
  const step = [1, 2, 2.5, 5, 10].find((s) => (s * mag * TICKS) >= v) ?? 10
  return step * mag * TICKS
}

/**
 * Money in vs money out per period: forest (chart-1) for money in, bg-accent lime for money out.
 * Hover or focus a period to read exact figures. Pair with a headline net
 * figure — the chart shows shape, the number states the answer.
 * The canvas for this component is at tempo/designs/design-system/data-display/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function CashFlowChart({ data, currency = 'USD', className, 'aria-label': ariaLabel }: CashFlowChartProps) {
  const max = niceMax(Math.max(...data.flatMap((d) => [d.moneyIn, d.moneyOut]), 0))
  const ticks = Array.from({ length: TICKS + 1 }, (_, i) => (max / TICKS) * (TICKS - i))
  const pct = (v: number) => `${Math.max((v / max) * 100, v > 0 ? 1.5 : 0)}%`
  const money = (v: number) => formatMoney(v, { currency, wholeUnits: true })

  return (
    <figure className={cx('flex flex-col gap-3', className)}>
      <div className="relative grid min-h-56 flex-1 grid-cols-[auto_1fr] gap-x-3" role="img" aria-label={ariaLabel}>
        {/* y axis */}
        <div className="flex flex-col justify-between pb-6 text-right text-caption text-fg-subtle" aria-hidden>
          {ticks.map((t) => (
            <span key={t} className="figure -translate-y-1/2 leading-none first:translate-y-0 last:translate-y-0">
              {formatMoney(t, { currency, compact: true })}
            </span>
          ))}
        </div>

        <div className="relative flex flex-col">
          {/* grid */}
          <div className="pointer-events-none absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between" aria-hidden>
            {ticks.map((t, i) => (
              <span key={t} className={cx('h-px w-full', i === TICKS ? 'bg-line' : 'border-t border-dashed border-chart-grid')} />
            ))}
          </div>


          {/* bars */}
          <div className="relative flex flex-1 items-stretch">
            {data.map((d, i) => (
              <div
                key={d.label}
                tabIndex={0}
                aria-label={`${d.label}${d.partial ? ' (to date)' : ''}: money in ${money(d.moneyIn)}, money out ${money(d.moneyOut)}`}
                className="group relative flex flex-1 flex-col rounded-sm outline-offset-2"
              >
                <div className="flex flex-1 items-end justify-center gap-1 px-[12%] pb-px transition-colors group-hover:bg-surface-hover group-focus-visible:bg-surface-hover">
                  {/* Bars grow in on mount, left to right, money out just behind money in */}
                  <Bar height={pct(d.moneyIn)} className="text-chart-1" fillClass="bg-chart-1" partial={d.partial} delay={i * 70} />
                  <Bar height={pct(d.moneyOut)} className="text-chart-highlight-strong" fillClass="bg-chart-highlight" partial={d.partial} delay={i * 70 + 50} />
                </div>
                <span className="flex h-6 items-end justify-center text-caption text-fg-subtle" aria-hidden>
                  {d.label}
                </span>

                {/* tooltip */}
                <div
                  className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden w-max -translate-x-1/2 rounded-md bg-inverse px-3 py-2 text-caption text-fg-inverse shadow-lg group-hover:block group-focus-visible:block"
                  aria-hidden
                >
                  <p className="mb-1 font-semibold">
                    {d.label}
                    {d.partial && <span className="font-regular text-fg-inverse-muted"> · to date</span>}
                  </p>
                  <p className="figure flex justify-between gap-4">
                    <span className="text-fg-inverse-muted">In</span> {money(d.moneyIn)}
                  </p>
                  <p className="figure flex justify-between gap-4">
                    <span className="text-fg-inverse-muted">Out</span> {money(d.moneyOut)}
                  </p>
                  <p className="figure mt-1 flex justify-between gap-4 border-t border-line-inverse pt-1 text-fg-inverse-accent">
                    <span>Net</span> {formatMoney(d.moneyIn - d.moneyOut, { currency, wholeUnits: true, signed: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-caption text-fg-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-xs bg-chart-1" aria-hidden />
          Money in
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-xs bg-chart-highlight" aria-hidden />
          Money out
        </span>
      </div>

      <table className="sr-only">
        <caption>{ariaLabel}</caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            <th scope="col">Money in</th>
            <th scope="col">Money out</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{money(d.moneyIn)}</td>
              <td>{money(d.moneyOut)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

// Month-to-date bars are hatched in the series colour so they read as unfinished.
const hatch = 'repeating-linear-gradient(135deg, currentColor 0 2px, transparent 2px 5px)'

function Bar({ height, className, fillClass, partial, delay = 0 }: { height: string; className: string; fillClass: string; partial?: boolean; delay?: number }) {
  return (
    <span
      className={cx('w-full max-w-5 origin-bottom animate-bar-grow rounded-t-xs motion-reduce:animate-none', className, partial ? 'border border-current' : fillClass)}
      style={{ height, backgroundImage: partial ? hatch : undefined, animationDelay: `${delay}ms` }}
    />
  )
}

defineControls(CashFlowChart, {
  data: { type: 'object' },
  currency: { type: 'select', options: ['USD', 'EUR', 'GBP', 'CAD'] },
  'aria-label': { type: 'text' },
})
