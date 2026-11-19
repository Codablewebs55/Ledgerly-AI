import { ArrowDown, ArrowUp, ListFilter } from 'lucide-react'
import { defineControls } from 'tempo-sdk/assets'
import { MenuItem, Popover } from '../navigation/Popover'
import { cx } from '../utils/cx'
import type { SortState } from './Table'

export type SortOption = { key: string; label: string }

export type SortMenuProps = {
  /** The sortable columns, in menu order. */
  options: SortOption[]
  value: SortState
  onChange: (sort: SortState) => void
  /** Accessible name, e.g. "Sort invoices". */
  label?: string
  className?: string
}

/**
 * Sort control for a table toolbar: a 32px round outlined button (14px ListFilter icon, same
 * shell as RowActions) beside the search field. It opens a menu of the sortable columns; the
 * active one shows its direction, and choosing it again flips the direction.
 * Keep it in sync with the Table's controlled `sort` so header arrows and the menu agree.
 * The canvas for this component is at tempo/designs/design-system/tables/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function SortMenu({ options, value, onChange, label = 'Sort', className }: SortMenuProps) {
  return (
    <Popover
      aria-label={label}
      align="end"
      strategy="fixed"
      className={cx('w-52', className)}
      trigger={(props) => (
        <button
          type="button"
          aria-label={label}
          {...props}
          className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full border border-line-control bg-surface text-fg transition-colors duration-(--duration-fast) hover:bg-surface-hover aria-expanded:bg-surface-hover"
        >
          <ListFilter className="size-3.5" aria-hidden />
        </button>
      )}
    >
      {options.map((o) => {
        const active = value.key === o.key
        const Dir = value.dir === 'asc' ? ArrowUp : ArrowDown
        return (
          <MenuItem
            key={o.key}
            className={cx(active && 'font-medium')}
            onSelect={() => onChange(active ? { key: o.key, dir: value.dir === 'asc' ? 'desc' : 'asc' } : { key: o.key, dir: 'desc' })}
            trailing={active ? <Dir className="size-3.5 text-fg-subtle" aria-label={value.dir === 'asc' ? 'ascending' : 'descending'} /> : undefined}
          >
            {o.label}
          </MenuItem>
        )
      })}
    </Popover>
  )
}

defineControls(SortMenu, {
  label: { type: 'text' },
  options: false,
  value: false,
  onChange: false,
})
