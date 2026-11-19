import { AlertCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'

export type FieldProps = {
  /** Id of the control this field labels. */
  id: string
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  required?: boolean
  optional?: boolean
  className?: string
  children: ReactNode
}


/**
 * Label + control + hint/error stack. Input, Select and Textarea render this
 * for you; use it directly only for custom controls.
 * The canvas for this component is at tempo/designs/design-system/forms/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function Field({ id, label, hint, error, required, optional, className, children }: FieldProps) {
  return (
    <div className={cx('flex min-w-0 flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-label text-fg">
          {label}
          {required && (
            <span className="text-fg-negative" aria-hidden>
              {' '}
              *
            </span>
          )}
          {optional && <span className="font-regular text-fg-subtle"> (optional)</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-caption text-fg-negative">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-caption text-fg-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  )
}


defineControls(Field, {
  label: { type: 'text' },
  hint: { type: 'text' },
  error: { type: 'text' },
  required: { type: 'boolean' },
  optional: { type: 'boolean' },
  id: false,
})
