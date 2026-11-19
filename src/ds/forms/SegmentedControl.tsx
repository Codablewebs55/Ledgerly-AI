import { useRef, useState, type KeyboardEvent } from 'react'
import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'

export type SegmentOption = { value: string; label: string }

export type SegmentedControlProps = {
  options: SegmentOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  size?: 'sm' | 'md'
  'aria-label': string
  fullWidth?: boolean
  className?: string
}

// Track adds 4px padding: sm = 32px, md = 36px overall.
const heights = { sm: 'h-6 text-label', md: 'h-7 text-body-sm' }

/**
 * Switch between 2–4 views of the same data (Month / Quarter / Year,
 * Chart / Table). Not for navigation between pages — use Tabs.
 * The canvas for this component is at tempo/designs/design-system/forms/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function SegmentedControl({
  options,
  value,
  defaultValue,
  onValueChange,
  size = 'md',
  fullWidth,
  className,
  'aria-label': ariaLabel,
}: SegmentedControlProps) {
  const [internal, setInternal] = useState(defaultValue ?? options[0]?.value)
  const current = value ?? internal
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const select = (v: string) => {
    setInternal(v)
    onValueChange?.(v)
  }

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!dir) return
    e.preventDefault()
    const next = (i + dir + options.length) % options.length
    select(options[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cx('inline-flex gap-1 rounded-md bg-surface-sunken p-1', fullWidth && 'flex w-full', className)}
    >
      {options.map((o, i) => {
        const active = o.value === current
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => select(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cx(
              'cursor-pointer rounded-sm px-3 font-medium whitespace-nowrap transition-[background-color,color] duration-(--duration-fast) ease-standard',
              heights[size],
              fullWidth && 'flex-1',
              active ? 'bg-surface text-fg ring-1 ring-line' : 'text-fg-muted hover:text-fg',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

defineControls(SegmentedControl, {
  options: { type: 'object' },
  defaultValue: { type: 'text' },
  size: { type: 'select' },
  fullWidth: { type: 'boolean' },
  value: false,
  onValueChange: false,
})
