import { X } from 'lucide-react'
import { useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'
import { useModal } from './use-modal'

const widths = { sm: 'md:max-w-md', md: 'md:max-w-lg', lg: 'md:max-w-2xl' }

export type DialogPanelProps = {
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  /** Usually right-aligned Buttons: secondary cancel + primary confirm. */
  footer?: ReactNode
  size?: keyof typeof widths
  onClose?: () => void
  titleId?: string
  className?: string
}

/**
 * The dialog surface on its own (no overlay or portal) — used by Dialog and
 * for static previews. Becomes a bottom sheet below 768px.
 * The canvas for this component is at tempo/designs/design-system/feedback/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function DialogPanel({ title, description, children, footer, size = 'md', onClose, titleId, className }: DialogPanelProps) {
  return (
    <div className={cx('flex w-full flex-col rounded-t-xl bg-surface-raised text-fg shadow-xl md:rounded-xl', widths[size], className)}>
      <div className="flex items-start justify-between gap-4 px-5 pt-5 md:px-6 md:pt-6">
        <div className="min-w-0">
          <h2 id={titleId} className="text-heading-lg">
            {title}
          </h2>
          {description && <p className="mt-1 max-w-96 text-body-sm text-fg-muted">{description}</p>}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mt-1 -mr-1 grid size-8 shrink-0 cursor-pointer place-items-center rounded-md text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
          >
            <X className="size-4.5" aria-hidden />
          </button>
        )}
      </div>
      {children && <div className="px-5 pt-4 md:px-6">{children}</div>}
      {footer && (
        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-line-subtle px-5 py-4 sm:flex-row sm:justify-end sm:gap-3 md:px-6">{footer}</div>
      )}
      {!footer && <div className="h-6" />}
    </div>
  )
}

export type DialogProps = Omit<DialogPanelProps, 'titleId' | 'onClose'> & {
  open: boolean
  onClose: () => void
}

// Focus the first form field / action, skipping the close button.
const skipClose = (items: HTMLElement[]) => items[1] ?? items[0]

/**
 * Modal for decisions that block the flow (confirm send, discard draft).
 * Traps focus, closes on Escape / scrim, restores focus on close.
 * The canvas for this component is at tempo/designs/design-system/feedback/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function Dialog({ open, onClose, ...panel }: DialogProps) {
  const titleId = useId()
  const ref = useRef<HTMLDivElement>(null)
  useModal(ref, open, onClose, skipClose)

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
      <div className="absolute inset-0 animate-fade-in bg-overlay" onClick={onClose} aria-hidden />
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className="relative flex w-full animate-sheet-in justify-center outline-none md:animate-dialog-in">
        <DialogPanel {...panel} titleId={titleId} onClose={onClose} />
      </div>
    </div>,
    document.body,
  )
}

defineControls(DialogPanel, {
  title: { type: 'text' },
  description: { type: 'text' },
  size: { type: 'select' },
  children: false,
  footer: false,
  onClose: false,
  titleId: false,
}); // ← keep: Tempo's HMR wrapper chains consecutive defineControls calls without ASI

defineControls(Dialog, {
  open: { type: 'boolean' },
  title: { type: 'text' },
  description: { type: 'text' },
  size: { type: 'select' },
  children: false,
  footer: false,
  onClose: false,
})
