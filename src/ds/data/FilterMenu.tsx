import { Check, ChevronDown } from 'lucide-react'
import { defineControls } from 'tempo-sdk/assets'
import { MenuItem, Popover } from '../navigation/Popover'
import { cx } from '../utils/cx'

export type FilterOption = { value: string; label: string }

export type FilterMenuProps = {
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
  /** Accessible name, e.g. "Date range". The trigger shows the chosen option's label. */
  label: string
  className?: string
}

/**
 * Single-choice dropdown filter for a page header or toolbar, e.g. a date range beside Export.
 * A 40px filled (surface-sunken) trigger with the chosen label and a chevron, so it reads as a
 * quiet setting next to outlined buttons. Opens a menu; the chosen option carries a check.
 * The canvas for this component is at tempo/designs/design-system/tables/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function FilterMenu({ options, value, onChange, label, className }: FilterMenuProps) {
  const current = options.find((o) => o.value === value) ?? options[0]
  return (
    <Popover
      aria-label={label}
      align="end"
      strategy="fixed"
      className="w-48"
      trigger={(props) => (
        <button
          type="button"
          aria-label={`${label}: ${current?.label}`}
          {...props}
          className={cx(
            'inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-md bg-surface-sunken px-4 border border-line text-body-sm text-fg transition-colors duration-(--duration-fast) hover:bg-surface-hover aria-expanded:bg-surface-hover',
            className,
          )}
        >
          {current?.label}
          <ChevronDown className="size-3.5" aria-hidden />
        </button>
      )}
    >
      {options.map((o) => (
        <MenuItem
          key={o.value}
          className={cx(o.value === value && 'font-medium')}
          onSelect={() => onChange(o.value)}
          trailing={o.value === value ? <Check className="size-3.5 text-fg-subtle" aria-label="selected" /> : undefined}
        >
          {o.label}
        </MenuItem>
      ))}
    </Popover>
  )
}

defineControls(FilterMenu, {
  label: { type: 'text' },
  value: { type: 'text' },
  options: false,
  onChange: false,
})
