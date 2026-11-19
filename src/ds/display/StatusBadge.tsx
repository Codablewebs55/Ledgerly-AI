import { defineControls } from 'tempo-sdk/assets'
import { Badge } from './Badge'
import { statusMeta, type Status } from './status'

export type { Status }

export type StatusBadgeProps = {
  status: Status
  size?: 'sm' | 'md'
  className?: string
}

/**
 * Status pill for invoices, expenses and bank transactions.
 * The canvas for this component is at tempo/designs/design-system/data-display/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const meta = statusMeta[status]
  return (
    <Badge tone={meta.tone} size={size} dot className={className}>
      {meta.label}
    </Badge>
  )
}

defineControls(StatusBadge, {
  status: { type: 'select' },
  size: { type: 'select' },
})
