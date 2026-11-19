import { AlertTriangle, CheckCircle2, Info, Sparkles, X, XCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'
import type { IconComponent } from '../utils/types'

export type AlertTone = 'info' | 'positive' | 'warning' | 'negative' | 'insight'

const tones: Record<AlertTone, { box: string; icon: string; Icon: IconComponent }> = {
  info: { box: 'border-line-info bg-info-subtle', icon: 'text-fg-info', Icon: Info },
  positive: { box: 'border-line-positive bg-positive-subtle', icon: 'text-fg-positive', Icon: CheckCircle2 },
  warning: { box: 'border-line-warning bg-warning-subtle', icon: 'text-fg-warning', Icon: AlertTriangle },
  negative: { box: 'border-line-negative bg-negative-subtle', icon: 'text-fg-negative', Icon: XCircle },
  // AI assistant output: lime tint + forest glyph tile. Reserved for insights.
  insight: { box: 'border-line bg-accent-subtle', icon: 'bg-brand text-fg-inverse-accent rounded-md p-1 size-6', Icon: Sparkles },
}

export type AlertProps = {
  tone?: AlertTone
  title?: ReactNode
  children?: ReactNode
  /** Trailing action(s), e.g. a ghost Button. */
  action?: ReactNode
  onDismiss?: () => void
  icon?: IconComponent
  className?: string
}

/**
 * Inline, persistent message tied to the content around it. For transient
 * confirmations use Toast; for blocking decisions use Dialog.
 * The canvas for this component is at tempo/designs/design-system/feedback/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function Alert({ tone = 'info', title, children, action, onDismiss, icon, className }: AlertProps) {
  const t = tones[tone]
  const Icon = icon ?? t.Icon
  return (
    <div
      role={tone === 'negative' ? 'alert' : 'status'}
      className={cx('flex items-start gap-3 rounded-lg border p-4', t.box, className)}
    >
      <Icon className={cx('size-5 shrink-0', t.icon)} aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {title && <p className="text-body-sm font-semibold text-fg">{title}</p>}
          {children && <div className={cx('text-body-sm text-fg-muted', !!title && 'mt-0.5')}>{children}</div>}
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-m-1 grid size-7 shrink-0 cursor-pointer place-items-center rounded-sm text-fg-subtle transition-colors hover:bg-surface hover:text-fg"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  )
}

defineControls(Alert, {
  tone: { type: 'select' },
  title: { type: 'text' },
  children: { type: 'text' },
  icon: false,
  action: false,
  onDismiss: false,
})
