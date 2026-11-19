import { ChevronLeft, ChevronRight } from 'lucide-react'
import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'

export type PaginationProps = {
  /** 1-based current page. */
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  /** Plural noun for the count, e.g. "invoices". */
  noun?: string
  className?: string
}

/** Page numbers to show: always first and last, the current page and its neighbours, gaps as null. */
function pageList(page: number, count: number): (number | null)[] {
  const keep = new Set([1, count, page - 1, page, page + 1].filter((p) => p >= 1 && p <= count))
  const sorted = [...keep].sort((a, b) => a - b)
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? [null, p] : [p]))
}

const pageBtn =
  'inline-flex h-8 min-w-8 cursor-pointer items-center justify-center gap-1 rounded-md px-2 text-label font-medium transition-colors duration-(--duration-fast) disabled:cursor-not-allowed disabled:text-fg-disabled'

/**
 * Footer for long tables: "Showing 1–10 of 24" plus page controls. On phones
 * only Previous / Next remain.
 * The canvas for this component is at tempo/designs/design-system/tables/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function Pagination({ page, pageSize, total, onPageChange, noun = 'results', className }: PaginationProps) {
  const count = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <nav aria-label="Pagination" className={cx('flex items-center justify-between gap-4', className)}>
      <p className="text-caption text-fg-subtle" aria-live="polite">
        Showing <span className="figure font-medium text-fg">{from}–{to}</span> of <span className="figure font-medium text-fg">{total}</span> {noun}
      </p>
      {count > 1 && (
        <div className="flex items-center gap-1">
          <button type="button" className={cx(pageBtn, 'text-fg-muted hover:bg-surface-hover hover:text-fg')} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft className="size-4" aria-hidden />
            <span className="sr-only sm:not-sr-only">Previous</span>
          </button>
          <span className="hidden items-center gap-1 sm:flex">
            {pageList(page, count).map((p, i) =>
              p === null ? (
                <span key={`gap-${i}`} className="px-1 text-caption text-fg-subtle" aria-hidden>
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  aria-current={p === page ? 'page' : undefined}
                  aria-label={`Page ${p}`}
                  onClick={() => onPageChange(p)}
                  className={cx(pageBtn, 'figure', p === page ? 'bg-brand text-fg-on-brand' : 'text-fg-muted hover:bg-surface-hover hover:text-fg')}
                >
                  {p}
                </button>
              ),
            )}
          </span>
          <button type="button" className={cx(pageBtn, 'text-fg-muted hover:bg-surface-hover hover:text-fg')} disabled={page >= count} onClick={() => onPageChange(page + 1)}>
            <span className="sr-only sm:not-sr-only">Next</span>
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      )}
    </nav>
  )
}

defineControls(Pagination, {
  page: { type: 'number' },
  pageSize: { type: 'number' },
  total: { type: 'number' },
  noun: { type: 'text' },
  onPageChange: false,
})
