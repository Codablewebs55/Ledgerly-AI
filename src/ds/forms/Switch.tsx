import { useId, useState, type ReactNode } from 'react'
import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'

export type SwitchProps = {
  label?: ReactNode
  description?: ReactNode
  /** Controlled value. Omit to let the switch manage itself. */
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

/**
 * Binary setting that applies immediately (auto-reminders, recurring
 * invoice). For choices submitted with a form, use Checkbox.
 * The canvas for this component is at tempo/designs/design-system/forms/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function Switch({ label, description, checked, defaultChecked = false, onCheckedChange, disabled, className }: SwitchProps) {
  const id = useId()
  const [internal, setInternal] = useState(defaultChecked)
  const on = checked ?? internal
  const toggle = () => {
    if (disabled) return
    setInternal(!on)
    onCheckedChange?.(!on)
  }

  return (
    <div className={cx('inline-flex items-start gap-3', className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={on}
        disabled={disabled}
        onClick={toggle}
        className={cx(
          'relative mt-px inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-(--duration-base) ease-standard disabled:cursor-not-allowed',
          on ? 'bg-brand' : 'bg-line-input',
          disabled && 'opacity-50',
        )}
      >
        <span
          className={cx(
            'inline-block size-4 rounded-full bg-surface shadow-sm transition-transform duration-(--duration-base) ease-standard',
            on ? 'translate-x-4.5' : 'translate-x-0.5',
          )}
        />
      </button>
      {(label || description) && (
        <label htmlFor={id} className={cx('flex flex-col gap-0.5', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}>
          {label && <span className={cx('text-body-sm', disabled ? 'text-fg-disabled' : 'text-fg')}>{label}</span>}
          {description && <span className="text-caption text-fg-subtle">{description}</span>}
        </label>
      )}
    </div>
  )
}

defineControls(Switch, {
  label: { type: 'text' },
  description: { type: 'text' },
  defaultChecked: { type: 'boolean' },
  disabled: { type: 'boolean' },
  checked: false,
  onCheckedChange: false,
})
