import { Check } from 'lucide-react'
import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: ReactNode
  description?: ReactNode
}

/**
 * Checkbox with label and optional description. Native input underneath, so
 * keyboard, forms and screen readers behave correctly for free.
 * The canvas for this component is at tempo/designs/design-system/forms/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function Checkbox({ label, description, id: idProp, className, disabled, ...rest }: CheckboxProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  return (
    <label htmlFor={id} className={cx('group inline-flex items-start gap-2.5', disabled ? 'cursor-not-allowed' : 'cursor-pointer', className)}>
      <span className="relative mt-px grid size-4.5 shrink-0 place-items-center">
        <input
          id={id}
          type="checkbox"
          disabled={disabled}
          className="peer size-4.5 cursor-[inherit] appearance-none rounded-xs border border-line-input bg-surface transition-colors duration-(--duration-fast) group-hover:border-line-input-hover checked:border-line-brand checked:bg-brand disabled:border-line disabled:bg-surface-sunken"
          {...rest}
        />
        <Check
          className="pointer-events-none absolute size-3 text-fg-on-brand opacity-0 transition-opacity duration-(--duration-fast) peer-checked:opacity-100 peer-disabled:text-fg-disabled"
          strokeWidth={3.5}
          aria-hidden
        />
      </span>
      {(label || description) && (
        <span className="flex flex-col gap-0.5">
          {label && <span className={cx('text-body-sm', disabled ? 'text-fg-disabled' : 'text-fg')}>{label}</span>}
          {description && <span className="text-caption text-fg-subtle">{description}</span>}
        </span>
      )}
    </label>
  )
}

defineControls(Checkbox, {
  label: { type: 'text' },
  description: { type: 'text' },
  defaultChecked: { type: 'boolean' },
  disabled: { type: 'boolean' },
  onChange: false,
})
