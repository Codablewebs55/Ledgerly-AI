import { ArrowUpDown, ChevronRight } from 'lucide-react'
import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react'
import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'

export type Column<T> = {
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  align?: 'start' | 'end'
  /** Enables sorting on this column. */
  sortValue?: (row: T) => string | number
  /** Drop low-priority columns on smaller desktops. */
  hideBelow?: 'lg' | 'xl'
  /** Tailwind width class, e.g. "w-40". */
  width?: string
}

export type SortState = { key: string; dir: 'asc' | 'desc' }

export type TableProps<T> = {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  /** Accessible name for the table. */
  caption: string
  onRowClick?: (row: T) => void
  /**
   * Below 768px tables become a stacked list. Provide a compact two-line
   * layout for each row; without it, cells stack as label/value pairs.
   */
  renderMobileRow?: (row: T) => ReactNode
  initialSort?: SortState
  /**
   * Controlled sort, for paginated tables: sort the full list yourself with
   * each column's `sortValue`, pass one page as `rows`, and keep `sort` here.
   */
  sort?: SortState
  onSortChange?: (sort: SortState) => void
  /** Highlights one row (e.g. the invoice that was just created). */
  highlightKey?: string
  empty?: ReactNode
  density?: 'comfortable' | 'compact'
  /** Adds a trailing right-aligned "Actions" column; return a <RowActions> menu for the row. */
  rowActions?: (row: T) => ReactNode
  /** Sits inside a Card (padding="none"): drops its own radius and side/bottom borders, keeping only the top rule. */
  embedded?: boolean
  className?: string
}

const hide = { lg: 'hidden lg:table-cell', xl: 'hidden xl:table-cell' }

/**
 * Data table with sorting, row navigation and a purpose-built mobile layout
 * (not a horizontally scrolling desktop table).
 * The canvas for this component is at tempo/designs/design-system/tables/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function Table<T>({
  columns,
  rows,
  rowKey,
  caption,
  onRowClick,
  renderMobileRow,
  initialSort,
  sort: sortProp,
  onSortChange,
  highlightKey,
  empty,
  density = 'comfortable',
  rowActions,
  embedded = false,
  className,
}: TableProps<T>) {
  const [internalSort, setInternalSort] = useState<SortState | undefined>(initialSort)
  const sort = sortProp ?? internalSort

  const sorted = useMemo(() => {
    const col = sort && columns.find((c) => c.key === sort.key)
    if (!col?.sortValue) return rows
    const get = col.sortValue
    const dir = sort!.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const av = get(a)
      const bv = get(b)
      return (av < bv ? -1 : av > bv ? 1 : 0) * dir
    })
  }, [rows, columns, sort])

  const toggleSort = (key: string) => {
    const next: SortState = sort?.key === key ? { key, dir: sort.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }
    setInternalSort(next)
    onSortChange?.(next)
  }

  const onRowKey = (e: KeyboardEvent, row: T) => {
    if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onRowClick(row)
    }
  }

  const cellPad = density === 'compact' ? 'px-4 py-2.5' : 'px-4 py-3.5'

  return (
    <div className={cx('min-w-0 overflow-hidden bg-surface', embedded ? 'border-t border-line' : 'rounded-lg border border-line', className)}>
      {/* ≥ md: real table */}
      <table className="hidden w-full border-collapse text-left md:table">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-surface-sunken">
          <tr>
            {columns.map((c) => {
              const active = sort?.key === c.key
              return (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                  className={cx(
                    'px-4 py-2.5 text-caption font-medium whitespace-nowrap text-fg-muted',
                    c.align === 'end' && 'text-right',
                    c.hideBelow && hide[c.hideBelow],
                    c.width,
                  )}
                >
                  {c.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(c.key)}
                      className={cx(
                        'inline-flex cursor-pointer items-center gap-1 rounded-xs hover:text-fg',
                        active && 'text-fg',
                      )}
                    >
                      {c.header}
                      {/* One icon, always after the label; the active column is shown by colour and aria-sort. */}
                      <ArrowUpDown className={cx('size-3', !active && 'opacity-50')} aria-hidden />
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              )
            })}
            {rowActions && (
              <th scope="col" className="w-px px-4 py-2.5 text-right text-caption font-medium whitespace-nowrap text-fg-muted">
                Actions
              </th>
            )}
            {onRowClick && <th className="w-10" aria-hidden />}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const key = rowKey(row)
            return (
              <tr
                key={key}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={(e) => onRowKey(e, row)}
                className={cx(
                  'group border-t border-line-subtle text-body-sm transition-colors duration-(--duration-fast)',
                  onRowClick && 'cursor-pointer hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:-outline-offset-2',
                  key === highlightKey && 'bg-surface-selected',
                )}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cx(cellPad, 'align-middle', c.align === 'end' && 'text-right', c.hideBelow && hide[c.hideBelow])}>
                    {c.cell(row)}
                  </td>
                ))}
                {rowActions && <td className="px-4 py-2 text-right align-middle">{rowActions(row)}</td>}
                {onRowClick && (
                  <td className="pr-3 text-fg-subtle">
                    <ChevronRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden />
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* < md: stacked list */}
      <ul className="divide-y divide-line-subtle md:hidden" aria-label={caption}>
        {sorted.map((row) => {
          const key = rowKey(row)
          const body = renderMobileRow ? (
            renderMobileRow(row)
          ) : (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
              {columns.map((c) => (
                <div key={c.key} className="contents">
                  <dt className="text-caption text-fg-subtle">{c.header}</dt>
                  <dd className="text-right text-body-sm">{c.cell(row)}</dd>
                </div>
              ))}
            </dl>
          )
          return (
            <li key={key} className={cx(rowActions && 'flex items-center', key === highlightKey && 'bg-surface-selected')}>
              {onRowClick ? (
                <button
                  type="button"
                  onClick={() => onRowClick(row)}
                  className="flex w-full min-w-0 flex-1 cursor-pointer items-center gap-3 px-4 py-3.5 text-left active:bg-surface-hover"
                >
                  <div className="min-w-0 flex-1">{body}</div>
                  <ChevronRight className="size-4 shrink-0 text-fg-subtle" aria-hidden />
                </button>
              ) : (
                <div className="min-w-0 flex-1 px-4 py-3.5">{body}</div>
              )}
              {rowActions && <div className="shrink-0 pr-4">{rowActions(row)}</div>}
            </li>
          )
        })}
      </ul>

      {rows.length === 0 && empty && <div className="border-t border-line-subtle md:border-t-0">{empty}</div>}
    </div>
  )
}

defineControls(Table, {
  caption: { type: 'text' },
  density: { type: 'select' },
  embedded: { type: 'boolean' },
  highlightKey: { type: 'text' },
  columns: false,
  rows: false,
  rowKey: false,
  onRowClick: false,
  renderMobileRow: false,
  rowActions: false,
  initialSort: false,
  sort: false,
  onSortChange: false,
  empty: false,
})
