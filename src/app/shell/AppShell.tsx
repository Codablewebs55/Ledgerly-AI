import { ChevronRight, Menu, PanelLeftOpen, Plus, Search, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useSearchParams } from 'react-router'
import { BottomNav, Button, Logo, LogoMark, Sheet, SideNav, useToast, WorkspaceCard } from '@/ds'
import { cx } from '@/ds/utils/cx'
import { appNav, mobileCreateAction, mobileNav, pageMetaFor } from '../navigation'
import { useAssistant } from './assistant-context'
import { AssistantProvider } from './AssistantPanel'
import { AccountMenuItems, NotificationsMenu, ProfileMenu } from './HeaderMenus'
import { currentUser } from './session'
import { SearchDialog } from './SearchDialog'

const CREATE_PATH = mobileCreateAction.to
const COLLAPSED_KEY = 'ledgerly:sidebar-collapsed'

function loadCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * Ledgerly app chrome. Three layouts from one tree:
 * - ≥ 1280px: full forest sidebar + top bar.
 * - 768–1279px (tablet): icon rail + top bar; the rail expands into a drawer.
 * - < 768px: compact header + bottom tab bar with a raised Create invoice action.
 *
 * `?panel=assistant|search|nav` opens a surface on load — used by the canvas
 * storyboards to review open states.
 */
export default function AppShell() {
  const [params] = useSearchParams()
  const panel = params.get('panel')
  return (
    <AssistantProvider defaultOpen={panel === 'assistant'}>
      <ShellLayout initialPanel={panel} />
    </AssistantProvider>
  )
}

function ShellLayout({ initialPanel }: { initialPanel: string | null }) {
  const { pathname } = useLocation()
  const assistant = useAssistant()
  const [navOpen, setNavOpen] = useState(initialPanel === 'nav')
  const [searchOpen, setSearchOpen] = useState(initialPanel === 'search')
  // Desktop only: the full sidebar can collapse to the icon rail. Remembered.
  const [collapsed, setCollapsed] = useState(loadCollapsed)
  const toggleCollapsed = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSED_KEY, c ? '0' : '1')
      } catch {
        // Storage unavailable — the choice still applies for this visit.
      }
      return !c
    })
  const page = pageMetaFor(pathname)
  const onCreate = pathname === CREATE_PATH

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  useEffect(() => {
    document.title = `${page.title} · Ledgerly`
  }, [page.title])

  // ⌘K / Ctrl+K opens search from anywhere in the app.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const openSearch = () => setSearchOpen(true)

  return (
    <div className="min-h-dvh bg-canvas text-fg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-60 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:text-body-sm focus:font-semibold"
      >
        Skip to content
      </a>

      {/* Desktop sidebar (≥ 1280): full, or collapsed to the icon rail. */}
      <SideNav
        sections={appNav}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        className="fixed inset-y-0 left-0 z-30 hidden xl:flex"
        header={
          collapsed ? (
            <Link to="/app" aria-label="Ledgerly overview" className="rounded-md focus-visible:outline-line-focus-inverse">
              <LogoMark tone="inverse" className="size-9" />
            </Link>
          ) : (
            <Link to="/app" aria-label="Ledgerly overview" className="rounded-md pt-4 focus-visible:outline-line-focus-inverse">
              <Logo tone="inverse" />
            </Link>
          )
        }
        footer={<OrgSummary />}
      />

      {/* Tablet rail (768–1279) */}
      <SideNav
        sections={appNav}
        collapsed
        className="fixed inset-y-0 left-0 z-30 hidden md:flex xl:hidden"
        header={
          <Link to="/app" aria-label="Ledgerly overview" className="rounded-md focus-visible:outline-line-focus-inverse">
            <LogoMark tone="inverse" className="size-9" />
          </Link>
        }
        footer={<Button variant="inverse" icon={PanelLeftOpen} aria-label="Expand navigation" onClick={() => setNavOpen(true)} />}
      />

      {/* Drawer: full navigation on phones and tablets */}
      <Sheet open={navOpen} onClose={() => setNavOpen(false)} side="left" aria-label="Navigation">
        <SideNav
          sections={appNav}
          onNavigate={() => setNavOpen(false)}
          className="w-full"
          header={
            <div className="flex w-full items-center justify-between">
              <Logo tone="inverse" />
              <Button variant="inverse" size="sm" icon={X} aria-label="Close navigation" className="border-transparent" onClick={() => setNavOpen(false)} />
            </div>
          }
          footer={<OrgSummary />}
        />
      </Sheet>

      <div className={cx('transition-[padding] duration-(--duration-base) ease-standard md:pl-(--ldg-sidebar-rail-width)', !collapsed && 'xl:pl-(--ldg-sidebar-width)')}>
        <TopBar page={page} onSearch={openSearch} onAssistant={assistant.open} showCreate={!onCreate} />
        <MobileHeader title={page.title} onMenu={() => setNavOpen(true)} onSearch={openSearch} onAssistant={assistant.open} />

        <main id="main" tabIndex={-1} className={cx('mx-auto overflow-x-clip max-w-(--ldg-content-max) px-(--ldg-page-gutter) pt-6 outline-none md:pt-8 md:pb-12', onCreate ? 'pb-12' : 'pb-28')}>
          <Outlet />
        </main>
      </div>

      {/* The create-invoice form is a focused task: no bottom nav (its own Send action closes the flow). */}
      {!onCreate && <BottomNav items={mobileNav} action={mobileCreateAction} className="md:hidden" />}

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} onAskAssistant={assistant.open} />
    </div>
  )
}

type HeaderActions = { onSearch: () => void; onAssistant: () => void }

/** Tablet and desktop top bar: breadcrumb, search, create, assistant, notifications, account. */
function TopBar({ page, onSearch, onAssistant, showCreate }: HeaderActions & { page: ReturnType<typeof pageMetaFor>; showCreate: boolean }) {
  return (
    <header className="sticky top-0 z-20 hidden h-(--ldg-topbar-height) items-center gap-3 border-b border-line bg-surface px-(--ldg-page-gutter) md:flex">
      <nav aria-label="Breadcrumb" className="min-w-0 flex-1 lg:flex-none">
        <ol className="flex items-center gap-1.5 text-body-sm">
          <li className="hidden shrink-0 lg:block">
            <Link to="/app" className="rounded-xs text-fg-subtle transition-colors hover:text-fg">
              {currentUser.org}
            </Link>
          </li>
          {page.parent && (
            <li className="flex shrink-0 items-center gap-1.5">
              <ChevronRight className="hidden size-3.5 text-fg-subtle lg:block" aria-hidden />
              <Link to={page.parent.to} className="rounded-xs text-fg-subtle transition-colors hover:text-fg">
                {page.parent.label}
              </Link>
            </li>
          )}
          <li className="flex min-w-0 items-center gap-1.5">
            <ChevronRight className={page.parent ? 'size-3.5 shrink-0 text-fg-subtle' : 'hidden size-3.5 shrink-0 text-fg-subtle lg:block'} aria-hidden />
            <span aria-current="page" className="truncate font-display text-heading-sm text-fg">
              {page.title}
            </span>
          </li>
        </ol>
      </nav>

      {/* Search: full field from 1024px, centred in the space between the
          breadcrumb and the actions; icon on tablet. */}
      <div className="hidden min-w-0 flex-1 justify-center lg:flex">
        <button
          type="button"
          onClick={onSearch}
          className="flex h-10 w-64 min-w-0 cursor-pointer items-center gap-2 rounded-md border border-line-field bg-surface px-3 text-body-sm text-fg-subtle transition-colors duration-(--duration-fast) hover:border-line-field-hover xl:w-80"
        >
          <Search className="size-4 shrink-0 opacity-70" aria-hidden />
          <span className="min-w-0 flex-1 truncate text-left opacity-70">Search invoices, customers…</span>
          <kbd className="rounded-xs border border-line px-1.5 font-sans text-caption text-fg-subtle">⌘K</kbd>
        </button>
      </div>
      <span className="lg:hidden">
        <Button variant="ghost" icon={Search} aria-label="Search" onClick={onSearch} />
      </span>

      <span className="hidden lg:contents">
        <Button variant="secondary" icon={Sparkles} onClick={onAssistant}>
          Ask Ledgerly
        </Button>
      </span>
      <span className="lg:hidden">
        <Button variant="secondary" icon={Sparkles} aria-label="Ask Ledgerly AI" onClick={onAssistant} />
      </span>

      {showCreate && (
        <Button icon={Plus} to={CREATE_PATH}>
          Create invoice
        </Button>
      )}

      <span className="mx-1 h-6 w-px bg-line" aria-hidden />
      <NotificationsMenu />
      <ProfileMenu />
    </header>
  )
}

/** Phone header: menu, page title, search, notifications, assistant. */
function MobileHeader({ title, onMenu, ...actions }: HeaderActions & { title: string; onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-1 border-b border-line bg-surface px-2 md:hidden">
      <Button variant="ghost" icon={Menu} aria-label="Open navigation" onClick={onMenu} />
      <p className="min-w-0 flex-1 truncate px-1 font-display text-heading-md">{title}</p>
      <Button variant="ghost" icon={Search} aria-label="Search" onClick={actions.onSearch} />
      <NotificationsMenu />
      <Button variant="ghost" icon={Sparkles} aria-label="Ask Ledgerly AI" onClick={actions.onAssistant} />
    </header>
  )
}

/** Sidebar footer: whose books these are, the account menu and the upgrade prompt. */
function OrgSummary() {
  const { show } = useToast()
  return (
    <WorkspaceCard
      name={currentUser.org}
      plan={currentUser.plan}
      menu={<AccountMenuItems />}
      upgrade={{
        label: '🚀 Go unlimited',
        onClick: () => show({ tone: 'info', title: 'Upgrades are outside this prototype', description: 'Plans and payments are simulated.' }),
      }}
    />
  )
}
