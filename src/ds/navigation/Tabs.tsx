import { useRef, useState, type KeyboardEvent } from 'react'
import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'

export type TabItem = { id: string; label: string; count?: number }

export type TabsProps = {
  items: TabItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
  'aria-label': string
  /** Prefix for tab/panel ids so consumers can set aria-labelledby on panels. */
  idPrefix?: string
  className?: string
}

/**
 * Underlined tabs for filtering or switching sections within one page
 * (All / Draft / Overdue / Paid). Scrolls horizontally on narrow screens.
 * The canvas for this component is at tempo/designs/design-system/navigation/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function Tabs({ items, value, defaultValue, onValueChange, idPrefix = 'tab', className, 'aria-label': ariaLabel }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.id)
  const current = value ?? internal
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const select = (id: string) => {
    setInternal(id)
    onValueChange?.(id)
  }

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!dir) return
    e.preventDefault()
    const next = (i + dir + items.length) % items.length
    select(items[next].id)
    refs.current[next]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cx('-mb-px flex gap-6 overflow-x-auto border-b border-line [scrollbar-width:none]', className)}
    >
      {items.map((t, i) => {
        const active = t.id === current
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el
            }}
            id={`${idPrefix}-${t.id}`}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => select(t.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cx(
              'relative flex h-11 shrink-0 cursor-pointer items-center gap-2 text-body-sm font-medium whitespace-nowrap transition-colors duration-(--duration-fast)',
              active ? 'text-fg' : 'text-fg-muted hover:text-fg',
            )}
          >
            {t.label}
            {t.count !== undefined && (
              <span
                className={cx(
                  'figure rounded-full px-1.5 py-px text-caption',
                  active ? 'bg-brand text-fg-on-brand' : 'bg-surface-sunken text-fg-muted',
                )}
              >
                {t.count}
              </span>
            )}
            <span
              className={cx(
                'absolute inset-x-0 bottom-0 h-0.5 rounded-full transition-colors duration-(--duration-fast)',
                active ? 'bg-brand' : 'bg-transparent',
              )}
              aria-hidden
            />
          </button>
        )
      })}
    </div>
  )
}

defineControls(Tabs, {
  items: { type: 'object' },
  defaultValue: { type: 'text' },
  value: false,
  onValueChange: false,
})
