import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'

export type SkeletonProps = {
  /** Size and shape via utilities, e.g. "h-4 w-32" or "size-8 rounded-full". */
  className?: string
}

/**
 * Loading placeholder that mirrors the final layout, so content doesn't
 * jump when it arrives. Pulses only when motion is allowed.
 * The canvas for this component is at tempo/designs/design-system/feedback/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function Skeleton({ className = 'h-4 w-full' }: SkeletonProps) {
  return <span aria-hidden className={cx('block rounded-sm bg-surface-sunken motion-safe:animate-pulse', className)} />
}

defineControls(Skeleton, {
  className: { type: 'text' },
})
