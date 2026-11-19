import { useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'
import { useModal } from './use-modal'

const panels = {
  // Navigation drawer: slides from the left at every size.
  left: 'inset-y-0 left-0 w-(--ldg-sidebar-width) max-w-[85vw] motion-safe:animate-drawer-left-in',
  // Side panel: a near-full-height bottom sheet on phones, a right-hand
  // panel from 768px.
  right:
    'inset-x-0 top-6 bottom-0 rounded-t-xl bg-surface-raised text-fg shadow-xl motion-safe:animate-sheet-in md:inset-x-auto md:top-0 md:right-0 md:w-(--ldg-sheet-width) md:rounded-none md:motion-safe:animate-drawer-right-in',
}

export type SheetProps = {
  open: boolean
  onClose: () => void
  side?: keyof typeof panels
  /** Name the sheet: pass `aria-labelledby` pointing at its heading, or `aria-label`. */
  'aria-label'?: string
  'aria-labelledby'?: string
  children: ReactNode
  className?: string
}

/**
 * Modal side panel — the navigation drawer (left) and tool panels such as
 * the AI assistant (right). Brings its own scrim, focus trap, Escape and
 * scroll lock; the content supplies its own header and close button.
 * Focus lands on the element marked `data-autofocus`, else the first control.
 * The canvas for this component is at tempo/designs/design-system/navigation/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function Sheet({ open, onClose, side = 'right', children, className, ...aria }: SheetProps) {
  const ref = useRef<HTMLDivElement>(null)
  useModal(ref, open, onClose, (_, root) => root.querySelector<HTMLElement>('[data-autofocus]'))

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 animate-fade-in bg-overlay" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={cx('fixed flex flex-col outline-none', panels[side], className)}
        {...aria}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}

defineControls(Sheet, {
  open: { type: 'boolean' },
  side: { type: 'select' },
  children: false,
  onClose: false,
})
