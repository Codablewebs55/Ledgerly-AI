import { ChevronDown } from 'lucide-react'
import { useId, type ReactNode, type SelectHTMLAttributes } from 'react'
import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'
import { Field } from './Field'
import { controlStates, controlSurface, fieldDescribedBy } from './field-utils'

export type SelectOption = { value: string; label: string; disabled?: boolean }

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
  options: SelectOption[]
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  optional?: boolean
  placeholder?: string
  size?: 'md' | 'lg'
  fieldClassName?: string
}

const heights = { md: 'h-10', lg: 'h-12' }

/**
 * Native select, styled — keeps the OS picker on mobile, which is the best
 * small-screen experience for short lists (currency, terms, tax rate).
 * The canvas for this component is at tempo/designs/design-system/forms/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function Select({
  options,
  label,
  hint,
  error,
  optional,
  placeholder,
  size = 'md',
  id: idProp,
  className,
  fieldClassName,
  disabled,
  required,
  ...rest
}: SelectProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  const state = disabled ? controlStates.disabled : error ? controlStates.invalid : controlStates.default

  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} optional={optional} className={fieldClassName}>
      <div className={cx('relative', heights[size], controlSurface, state, className)}>
        <select
          id={id}
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldDescribedBy(id, hint, error)}
          className="h-full w-full cursor-pointer appearance-none rounded-md bg-transparent pr-9 pl-3 text-body-sm text-fg outline-none focus-visible:outline-none disabled:cursor-not-allowed"
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-fg-subtle" aria-hidden />
      </div>
    </Field>
  )
}

defineControls(Select, {
  label: { type: 'text' },
  hint: { type: 'text' },
  error: { type: 'text' },
  placeholder: { type: 'text' },
  size: { type: 'select' },
  disabled: { type: 'boolean' },
  optional: { type: 'boolean' },
  options: { type: 'object' },
  onChange: false,
})
