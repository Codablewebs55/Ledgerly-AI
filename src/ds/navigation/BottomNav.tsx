import { NavLink } from 'react-router'
import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'
import type { NavItemDef } from './SideNav'

export type BottomNavProps = {
  /** 4 destinations max — more belongs in the "More" sheet. */
  items: NavItemDef[]
  /** Raised centre action, e.g. New invoice. */
  action?: Omit<NavItemDef, 'badge' | 'end'>
  /** Pin to the viewport bottom (default). Turn off for previews. */
  fixed?: boolean
  className?: string
}

/**
 * Mobile tab bar (< 768px). Thumb-reachable destinations plus one primary
 * create action in the centre.
 * The canvas for this component is at tempo/designs/design-system/navigation/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function BottomNav({ items, action, fixed = true, className }: BottomNavProps) {
  const half = Math.ceil(items.length / 2)
  const left = action ? items.slice(0, half) : items
  const right = action ? items.slice(half) : []

  const link = (item: NavItemDef) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cx(
          'relative flex h-full flex-1 flex-col items-center justify-center gap-1 text-caption font-medium transition-colors duration-(--duration-fast)',
          isActive ? 'text-fg-brand' : 'text-fg-subtle hover:text-fg',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span className={cx('absolute top-0 h-0.5 w-8 rounded-full', isActive ? 'bg-brand' : 'bg-transparent')} aria-hidden />
          <item.icon className="size-5" aria-hidden />
          {item.label}
        </>
      )}
    </NavLink>
  )

  return (
    <nav
      aria-label="Main"
      className={cx(
        'z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]',
        fixed && 'fixed inset-x-0 bottom-0',
        className,
      )}
    >
      <div className="flex h-16 items-stretch">
        {left.map(link)}
        {action && (
          <div className="flex flex-1 items-center justify-center">
            <NavLink
              to={action.to}
              aria-label={action.label}
              className="-mt-6 grid size-14 place-items-center rounded-full bg-brand text-fg-on-brand ring-4 ring-surface transition-transform duration-(--duration-fast) active:scale-95"
            >
              <action.icon className="size-6" aria-hidden />
            </NavLink>
          </div>
        )}
        {right.map(link)}
      </div>
    </nav>
  )
}

defineControls(BottomNav, {
  fixed: { type: 'boolean' },
  items: false,
  action: false,
})
