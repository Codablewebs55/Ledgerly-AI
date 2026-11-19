import { Ellipsis } from 'lucide-react'
import type { ReactNode } from 'react'
import { defineControls } from 'tempo-sdk/assets'
import { Popover } from '../navigation/Popover'
import { cx } from '../utils/cx'

export type RowActionsProps = {
  /** Accessible name naming the record, e.g. "Actions for INV-1037". */
  label: string
  /** MenuItems (and MenuSeparators) for this row. */
  children: ReactNode
  className?: string
}

/**
 * Overflow menu for one table row: a 32px round outlined "•••" button (14px icon) that opens a
 * menu of MenuItems. Lives in the Table's trailing Actions column (`rowActions`).
 * The panel is viewport-positioned, so it is never clipped by the table or card.
 * Clicks stay inside the menu and never trigger the row's own onRowClick.
 * The canvas for this component is at tempo/designs/design-system/tables/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function RowActions({ label, children, className }: RowActionsProps) {
  return (
    // Stop clicks and keys reaching an interactive <tr>.
    <div className={cx('inline-flex', className)} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <Popover
        aria-label={label}
        align="end"
        strategy="fixed"
        className="w-52"
        trigger={(props) => (
          <button
            type="button"
            aria-label={label}
            {...props}
            className="grid size-8 cursor-pointer place-items-center rounded-full border border-line-control bg-surface text-fg transition-colors duration-(--duration-fast) hover:bg-surface-hover aria-expanded:bg-surface-hover"
          >
            <Ellipsis className="size-3.5" aria-hidden />
          </button>
        )}
      >
        {children}
      </Popover>
    </div>
  )
}

defineControls(RowActions, {
  label: { type: 'text' },
  children: false,
})
