import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'
import { ToastContext, type ToastOptions } from './toast-context'

export type { ToastOptions }

const icons = { success: CheckCircle2, info: Info, error: AlertTriangle }

export type ToastCardProps = ToastOptions & { onDismiss?: () => void; className?: string }

/**
 * The visual toast. Dark (inverse) so it reads above any page surface.
 * Rendered by ToastProvider; exported for previews and docs.
 * The canvas for this component is at tempo/designs/design-system/feedback/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function ToastCard({ title, description, tone = 'success', action, onDismiss, className }: ToastCardProps) {
  const Icon = icons[tone]
  return (
    <div className={cx('pointer-events-auto flex w-full items-start gap-3 rounded-lg bg-inverse p-4 text-fg-inverse shadow-xl', className)}>
      <Icon className={cx('mt-px size-5 shrink-0', tone === 'error' ? 'text-fg-inverse' : 'text-fg-inverse-accent')} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-body-sm font-semibold">{title}</p>
        {description && <p className="mt-0.5 text-body-sm text-fg-inverse-muted">{description}</p>}
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-2 cursor-pointer rounded-xs text-body-sm font-semibold text-fg-inverse-accent underline-offset-4 hover:underline focus-visible:outline-line-focus-inverse"
          >
            {action.label}
          </button>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="-m-1 grid size-7 shrink-0 cursor-pointer place-items-center rounded-sm text-fg-inverse-muted transition-colors hover:bg-inverse-raised hover:text-fg-inverse focus-visible:outline-line-focus-inverse"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  )
}

type ToastEntry = ToastOptions & { id: number }

/** Mount once at the app root. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([])
  const seq = useRef(0)

  const dismiss = useCallback((id: number) => setToasts((ts) => ts.filter((t) => t.id !== id)), [])
  const show = useCallback(
    (t: ToastOptions) => {
      const id = ++seq.current
      setToasts((ts) => [...ts.slice(-2), { ...t, id }])
      window.setTimeout(() => dismiss(id), t.duration ?? 5000)
    },
    [dismiss],
  )
  const api = useMemo(() => ({ show, dismiss }), [show, dismiss])

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Above the mobile bottom nav (64px) on small screens. */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 bottom-20 z-50 flex flex-col gap-2 md:inset-x-auto md:right-6 md:bottom-6 md:w-96"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} {...t} onDismiss={() => dismiss(t.id)} className="animate-toast-in" />
        ))}
      </div>
    </ToastContext.Provider>
  )
}


defineControls(ToastCard, {
  title: { type: 'text' },
  description: { type: 'text' },
  tone: { type: 'select' },
  action: false,
  onDismiss: false,
  duration: false,
})
