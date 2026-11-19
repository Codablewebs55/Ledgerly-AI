import { useId, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'
import { Field } from './Field'
import { controlStates, controlSurface, fieldDescribedBy } from './field-utils'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  optional?: boolean
  fieldClassName?: string
}

/**
 * Multi-line text (notes, memos, payment terms).
 * The canvas for this component is at tempo/designs/design-system/forms/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function Textarea({ label, hint, error, optional, id: idProp, className, fieldClassName, disabled, required, rows = 3, placeholder = ' ', ...rest }: TextareaProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  const state = disabled ? controlStates.disabled : error ? controlStates.invalid : controlStates.default

  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} optional={optional} className={fieldClassName}>
      <div className={cx('px-3 py-2', controlSurface, state, className)}>
        <textarea
          id={id}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldDescribedBy(id, hint, error)}
          className="block w-full resize-y bg-transparent text-body-sm text-fg outline-none placeholder:text-fg-subtle placeholder:opacity-70 focus-visible:outline-none disabled:cursor-not-allowed"
          {...rest}
        />
      </div>
    </Field>
  )
}

defineControls(Textarea, {
  label: { type: 'text' },
  placeholder: { type: 'text' },
  hint: { type: 'text' },
  error: { type: 'text' },
  rows: { type: 'number' },
  disabled: { type: 'boolean' },
  optional: { type: 'boolean' },
  onChange: false,
})
