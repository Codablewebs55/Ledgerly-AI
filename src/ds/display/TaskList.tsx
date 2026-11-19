import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'
import type { IconComponent } from '../utils/types'

export type TaskTone = 'negative' | 'warning' | 'info' | 'neutral'

const tones: Record<TaskTone, string> = {
  negative: 'bg-negative-subtle text-fg-negative',
  warning: 'bg-warning-subtle text-fg-warning',
  info: 'bg-info-subtle text-fg-info',
  neutral: 'bg-surface-sunken text-fg-muted',
}

export type TaskItem = {
  icon: IconComponent
  tone?: TaskTone
  title: string
  meta: string
  to: string
}

export type TaskListProps = {
  items: TaskItem[]
  className?: string
}

/**
 * Linked to-do rows: a 36px tone-tinted icon tile, title, one-line meta and a chevron that nudges on hover.
 * Used in the dashboard's Needs attention card; the tone says how urgent a row is (negative first).
 * The canvas for this component is at tempo/designs/design-system/data-display/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function TaskList({ items, className }: TaskListProps) {
  return (
    <ul className={cx('flex flex-col', className)}>
      {items.map((i) => (
        <li key={i.to}>
          <Link
            to={i.to}
            className="group flex items-center gap-3 rounded-md px-3 py-3 transition-colors duration-(--duration-fast) hover:bg-surface-hover"
          >
            <span className={cx('grid size-9 shrink-0 place-items-center rounded-md', tones[i.tone ?? 'neutral'])}>
              <i.icon className="size-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-body-sm font-medium">{i.title}</span>
              <span className="block truncate text-caption text-fg-subtle">{i.meta}</span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  )
}

defineControls(TaskList, {
  items: { type: 'object' },
})
