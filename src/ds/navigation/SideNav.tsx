import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router'
import { defineControls } from 'tempo-sdk/assets'
import { Button } from '../actions/Button'
import { cx } from '../utils/cx'
import type { IconComponent } from '../utils/types'

export type NavItemDef = {
  label: string
  to: string
  icon: IconComponent
  /** Small count or "New" marker. */
  badge?: string | number
  /** Match the path exactly (for index routes like /app). */
  end?: boolean
}

export type NavSection = { title?: string; items: NavItemDef[] }

export type SideNavProps = {
  sections: NavSection[]
  header?: ReactNode
  footer?: ReactNode
  /** Icon-only rail (tablet). Labels become tooltips; counts become dots. */
  collapsed?: boolean
  /** Called after an item is chosen — e.g. to close a navigation drawer. */
  onNavigate?: () => void
  /**
   * Adds the collapse control: a close icon beside the header when expanded,
   * an expand icon in the footer slot when collapsed.
   */
  onToggleCollapsed?: () => void
  className?: string
}

/**
 * Primary app navigation. Full width from 1280px (collapsible to the icon
 * rail via `onToggleCollapsed`), a collapsed icon rail on tablets, and inside
 * the navigation drawer on phones. Deep forest rail; the
 * active item gets a lime marker — the one place lime appears in app chrome.
 * The canvas for this component is at tempo/designs/design-system/navigation/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function SideNav({ sections, header, footer, collapsed = false, onNavigate, onToggleCollapsed, className }: SideNavProps) {
  const headerContent =
    onToggleCollapsed && !collapsed ? (
      <div className="flex w-full items-end justify-between">
        {header}
        <Button
          variant="inverse"
          icon={PanelLeftClose}
          aria-label="Collapse navigation"
          className="-mr-2 border-transparent"
          onClick={onToggleCollapsed}
        />
      </div>
    ) : (
      header
    )
  const footerContent =
    onToggleCollapsed && collapsed ? (
      <Button variant="inverse" icon={PanelLeftOpen} aria-label="Expand navigation" onClick={onToggleCollapsed} />
    ) : (
      footer
    )

  return (
    <nav
      aria-label="Main"
      className={cx(
        'flex h-full flex-col bg-inverse text-fg-inverse',
        collapsed ? 'w-(--ldg-sidebar-rail-width)' : 'w-(--ldg-sidebar-width)',
        className,
      )}
    >
      {headerContent && (
        <div className={cx('flex h-(--ldg-topbar-height) shrink-0 items-center', collapsed ? 'justify-center' : 'px-5')}>{headerContent}</div>
      )}
      {/* The rail can't scroll: tooltips need to overflow its right edge. */}
      <div className={cx('flex flex-1 flex-col py-4', collapsed ? 'items-center gap-3 px-3' : 'gap-6 overflow-y-auto px-3')}>
        {sections.map((section, i) => (
          <div key={section.title ?? i} className={cx('flex flex-col gap-0.5', collapsed && 'items-center')}>
            {section.title &&
              (collapsed ? (
                i > 0 && <span className="mb-3 h-px w-6 bg-line-inverse" aria-hidden />
              ) : (
                <p className="px-3 pb-1.5 text-caption text-fg-inverse-subtle">{section.title}</p>
              ))}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                aria-label={collapsed ? (item.badge !== undefined ? `${item.label}, ${item.badge} waiting` : item.label) : undefined}
                className={({ isActive }) =>
                  cx(
                    'group relative flex h-10 items-center rounded-md text-body-sm font-medium transition-colors duration-(--duration-fast) focus-visible:outline-line-focus-inverse',
                    collapsed ? 'w-10 justify-center' : 'gap-3 px-3',
                    isActive ? 'bg-inverse-raised text-fg-inverse' : 'text-fg-inverse-muted hover:bg-inverse-raised hover:text-fg-inverse',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cx(
                        'absolute top-2 bottom-2 w-0.5 rounded-full transition-colors',
                        collapsed ? '-left-3' : 'left-0',
                        isActive ? 'bg-accent' : 'bg-transparent',
                      )}
                      aria-hidden
                    />
                    <item.icon className={cx('size-4.5 shrink-0', isActive && 'text-fg-inverse-accent')} aria-hidden />
                    {collapsed ? (
                      <>
                        {item.badge !== undefined && (
                          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-accent ring-2 ring-inverse" aria-hidden />
                        )}
                        <span
                          className="pointer-events-none absolute left-full z-50 ml-3 rounded-sm bg-inverse-raised px-2 py-1 text-caption whitespace-nowrap text-fg-inverse opacity-0 shadow-lg transition-opacity duration-(--duration-fast) group-hover:opacity-100 group-focus-visible:opacity-100"
                          aria-hidden
                        >
                          {item.label}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge !== undefined && (
                          <span className="figure rounded-full bg-accent px-1.5 py-px text-caption font-semibold text-fg-on-accent">{item.badge}</span>
                        )}
                      </>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>
      {footerContent && (
        <div className={cx('shrink-0 p-3', collapsed && 'flex justify-center')}>{footerContent}</div>
      )}
    </nav>
  )
}

defineControls(SideNav, {
  sections: false,
  collapsed: { type: 'boolean' },
  header: false,
  footer: false,
  onNavigate: false,
  onToggleCollapsed: false,
})
