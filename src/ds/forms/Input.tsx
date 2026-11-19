import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'
import type { IconComponent } from '../utils/types'
import { Field } from './Field'
import { controlStates, controlSurface, fieldDescribedBy } from './field-utils'

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> & {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  optional?: boolean
  /** Leading icon (search, calendar…). */
  icon?: IconComponent
  /** Inline text before the value, e.g. "$". */
  prefix?: ReactNode
  /** Inline text after the value, e.g. "%" or "USD". */
  suffix?: ReactNode
  /** A small control inside the field's right edge, e.g. a send Button (size="sm"). */
  action?: ReactNode
  /** `sm` (32px) only for toolbar search beside 32px icon buttons; forms use `md`. */
  size?: 'sm' | 'md' | 'lg'
  /** `end` right-aligns with tabular figures — use for amounts. */
  align?: 'start' | 'end'
  fieldClassName?: string
}

const heights = { sm: 'h-8', md: 'h-10', lg: 'h-12' }

/**
 * Text input with optional label, hint, error, icon, affixes and an inline
 * `action` (e.g. the AI composer's send button).
 * The canvas for this component is at tempo/designs/design-system/forms/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function Input({
  label,
  hint,
  error,
  optional,
  icon: Icon,
  prefix,
  suffix,
  action,
  size = 'md',
  align = 'start',
  id: idProp,
  className,
  fieldClassName,
  disabled,
  required,
  placeholder = ' ',
  ...rest
}: InputProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  const state = disabled ? controlStates.disabled : error ? controlStates.invalid : controlStates.default

  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} optional={optional} className={fieldClassName}>
      <div className={cx('flex w-full max-w-100 items-center gap-2 pl-3', action ? 'pr-1.5' : 'pr-3', heights[size], controlSurface, state, className)}>
        {Icon && <Icon className="size-4 shrink-0 text-fg-subtle opacity-70" aria-hidden />}
        {prefix && <span className="shrink-0 text-body-sm text-fg-subtle">{prefix}</span>}
        <input
          id={id}
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldDescribedBy(id, hint, error)}
          placeholder={placeholder}
          className={cx(
            'h-full w-full min-w-0 bg-transparent text-body-sm text-fg outline-none placeholder:text-fg-subtle placeholder:opacity-70 focus-visible:outline-none disabled:cursor-not-allowed',
            align === 'end' && 'figure text-right',
          )}
          {...rest}
        />
        {suffix && <span className="shrink-0 text-body-sm text-fg-subtle">{suffix}</span>}
        {action && <span className="flex shrink-0 items-center">{action}</span>}
      </div>
    </Field>
  )
}

defineControls(Input, {
  label: { type: 'text' },
  placeholder: { type: 'text' },
  hint: { type: 'text' },
  error: { type: 'text' },
  prefix: { type: 'text' },
  suffix: { type: 'text' },
  size: { type: 'select' },
  align: { type: 'select' },
  disabled: { type: 'boolean' },
  required: { type: 'boolean' },
  optional: { type: 'boolean' },
  icon: false,
  onChange: false,
})
