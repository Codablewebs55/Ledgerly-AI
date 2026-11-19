import { ArrowUpRight } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'
import { Button, Logo, LogoMark } from '@/ds'
import { cx } from '@/ds/utils/cx'

const links = [
  { to: '/design-system/foundations', label: 'Foundations' },
  { to: '/design-system/components', label: 'Components' },
]

export default function DesignSystemLayout() {
  return (
    <div className="min-h-screen bg-canvas text-fg">
      <header className="sticky top-0 z-40 border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-(--ldg-content-max) items-center gap-4 px-(--ldg-page-gutter) md:gap-8">
          <NavLink to="/" aria-label="Ledgerly home" className="shrink-0 rounded-md">
            <span className="hidden sm:block">
              <Logo />
            </span>
            <LogoMark className="size-8 sm:hidden" />
          </NavLink>
          <span className="hidden text-body-sm text-fg-subtle md:inline">Design system</span>
          <nav aria-label="Design system" className="flex h-full items-stretch gap-5 sm:ml-2">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cx(
                    'relative flex items-center text-body-sm font-medium transition-colors',
                    isActive ? 'text-fg after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-brand' : 'text-fg-muted hover:text-fg',
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <span className="ml-auto hidden sm:block">
            <Button to="/app" variant="secondary" size="sm" icon={ArrowUpRight} iconPosition="end">
              Open app
            </Button>
          </span>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
