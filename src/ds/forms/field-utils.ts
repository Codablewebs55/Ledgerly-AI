import type { ReactNode } from 'react'

/** aria-describedby value matching the message Field renders. */
export function fieldDescribedBy(id: string, hint?: ReactNode, error?: ReactNode) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined
}

/** Shared control-surface classes so every form control reads as one family. */
export const controlSurface =
  'rounded-md border bg-surface text-fg transition-[border-color,box-shadow] duration-(--duration-fast) ease-standard'
export const controlStates = {
  default: 'ldg-field focus-within:ring-4 focus-within:ring-brand-subtle',
  invalid: 'border-line-invalid focus-within:ring-4 focus-within:ring-negative-subtle',
  disabled: 'cursor-not-allowed border-line bg-surface-sunken text-fg-disabled',
}
