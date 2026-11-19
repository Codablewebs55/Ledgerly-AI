import { AlertTriangle, Bell, BookOpen, CheckCircle2, ChevronDown, CreditCard, Globe, Landmark, LogOut, Settings } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Avatar, Button, MenuItem, MenuSeparator, Popover, useToast, type IconComponent } from '@/ds'
import { cx } from '@/ds/utils/cx'
import { currentUser } from './session'


type Notice = { id: string; title: string; meta: string; icon: IconComponent; tone: string; to: string }

const notices: Notice[] = [
  { id: 'paid-1038', title: 'Lumen Health paid INV-1038', meta: '$22,600.00 · 2 hours ago', icon: CheckCircle2, tone: 'text-fg-positive', to: '/app/invoices' },
  { id: 'bank-5', title: '5 bank transactions to reconcile', meta: 'Business Checking · Today', icon: Landmark, tone: 'text-fg-info', to: '/app/banking' },
  { id: 'overdue-1041', title: 'INV-1041 is 5 days overdue', meta: 'Harbor & Pine Co. · $3,200.00', icon: AlertTriangle, tone: 'text-fg-warning', to: '/app/invoices' },
]

const READ_KEY = 'ledgerly:notifications-read'

function loadRead(): string[] {
  try {
    return JSON.parse(localStorage.getItem(READ_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

/** Bell with unread dot and a panel of recent activity. Read state persists. */
export function NotificationsMenu() {
  const [read, setRead] = useState(loadRead)
  const unread = notices.filter((n) => !read.includes(n.id)).length

  const markRead = (ids: string[]) => {
    const next = [...new Set([...read, ...ids])]
    setRead(next)
    try {
      localStorage.setItem(READ_KEY, JSON.stringify(next))
    } catch {
      // Storage unavailable (private mode) — state still updates for this session.
    }
  }

  return (
    <Popover
      role="dialog"
      aria-label="Notifications"
      className="w-80"
      trigger={(props) => (
        <span className="relative inline-flex">
          <Button variant="ghost" icon={Bell} aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'} {...props} />
          {unread > 0 && <span className="pointer-events-none absolute top-2 right-2.5 size-2 rounded-full bg-negative ring-2 ring-surface" aria-hidden />}
        </span>
      )}
    >
      <div className="flex items-center justify-between px-2.5 pt-1.5 pb-2">
        <p className="text-heading-sm">Notifications</p>
        {unread > 0 && (
          <Button variant="ghost" size="sm" className="-mr-1" onClick={() => markRead(notices.map((n) => n.id))}>
            Mark all as read
          </Button>
        )}
      </div>
      {notices.map((n) => (
        <MenuItem
          key={n.id}
          to={n.to}
          icon={n.icon}
          description={n.meta}
          onSelect={() => markRead([n.id])}
          iconClassName={n.tone}
          trailing={!read.includes(n.id) ? <span className="size-2 rounded-full bg-brand" aria-label="Unread" /> : undefined}
        >
          <span className={cx(!read.includes(n.id) && 'font-medium')}>{n.title}</span>
        </MenuItem>
      ))}
      <MenuSeparator />
      <MenuItem to="/app/settings" icon={Settings}>
        Notification settings
      </MenuItem>
    </Popover>
  )
}

/** Account menu: avatar trigger in the top bar. */
export function ProfileMenu() {
  return (
    <Popover
      aria-label="Account"
      side="bottom"
      align="end"
      className="w-64"
      trigger={(props) => (
        <button
          type="button"
          {...props}
          aria-label={`Account menu for ${currentUser.name}`}
          className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line-control p-1 transition-colors duration-(--duration-fast) hover:bg-surface-hover"
        >
          <Avatar name={currentUser.name} size="md" />
          <ChevronDown className="mr-0.5 hidden size-4 text-fg-subtle lg:block" aria-hidden />
        </button>
      )}
    >
      <div className="flex items-center gap-3 px-2.5 pt-1.5 pb-2.5">
        <Avatar name={currentUser.name} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-body-sm font-semibold">{currentUser.name}</p>
          <p className="truncate text-caption text-fg-subtle">{currentUser.email}</p>
        </div>
      </div>
      <MenuSeparator />
      <AccountMenuItems />
    </Popover>
  )
}

/** Account actions, shared by the top-bar profile menu and the side nav workspace card. */
export function AccountMenuItems() {
  const navigate = useNavigate()
  const { show } = useToast()
  return (
    <>
      <MenuItem to="/app/settings" icon={Settings}>
        Profile and settings
      </MenuItem>
      <MenuItem
        icon={CreditCard}
        description={`${currentUser.org} · ${currentUser.plan}`}
        onSelect={() => show({ tone: 'info', title: 'Billing is outside this prototype', description: 'Plans and payments are simulated.' })}
      >
        Billing and plan
      </MenuItem>
      <MenuSeparator />
      <MenuItem to="/design-system" icon={BookOpen}>
        Design system
      </MenuItem>
      <MenuItem to="/" icon={Globe}>
        Marketing site
      </MenuItem>
      <MenuSeparator />
      <MenuItem
        icon={LogOut}
        tone="danger"
        onSelect={() => {
          show({ tone: 'info', title: 'Signed out', description: 'This is a prototype — no account was changed.' })
          navigate('/')
        }}
      >
        Sign out
      </MenuItem>
    </>
  )
}
