import { ArrowLeftRight, CircleHelp, FileText, Landmark, LayoutDashboard, PieChart, Plus, Receipt, Settings, Users } from 'lucide-react'
import type { NavItemDef, NavSection } from '@/ds'

// Single source of truth for app navigation — used by the app shell and by
// the design-system navigation docs, so both always match.

const overview: NavItemDef = { label: 'Overview', to: '/app', icon: LayoutDashboard, end: true }
const invoices: NavItemDef = { label: 'Invoices', to: '/app/invoices', icon: FileText, badge: 4 }
const expenses: NavItemDef = { label: 'Expenses', to: '/app/expenses', icon: Receipt }
const transactions: NavItemDef = { label: 'Transactions', to: '/app/transactions', icon: ArrowLeftRight }
const banking: NavItemDef = { label: 'Banking', to: '/app/banking', icon: Landmark, badge: 5 }
const reports: NavItemDef = { label: 'Reports', to: '/app/reports', icon: PieChart }
const customers: NavItemDef = { label: 'Customers', to: '/app/customers', icon: Users }
const settings: NavItemDef = { label: 'Settings', to: '/app/settings', icon: Settings }
const help: NavItemDef = { label: 'Help', to: '/app/help', icon: CircleHelp }

export const appNav: NavSection[] = [
  { items: [overview, invoices, expenses] },
  { title: '📊  Accounting', items: [transactions, banking, reports] },
  { title: '💼  Workspace', items: [customers, settings, help] },
]

/** Phone tab bar: the four most-used destinations. The rest live in the drawer. */
export const mobileNav: NavItemDef[] = [overview, invoices, expenses, banking].map(({ badge: _badge, ...item }) => item)

export const mobileCreateAction = { label: 'Create invoice', to: '/app/invoices/new', icon: Plus }

export type PageMeta = { title: string; parent?: { label: string; to: string } }

const nestedPages: Record<string, PageMeta> = {
  '/app/invoices/new': { title: 'Create invoice', parent: { label: 'Invoices', to: '/app/invoices' } },
}

const navItems = appNav.flatMap((s) => s.items)

/** Title and parent for the top bar breadcrumb and mobile header. */
export function pageMetaFor(pathname: string): PageMeta {
  const path = pathname.replace(/\/+$/, '') || '/'
  const item = navItems.find((i) => i.to === path)
  return nestedPages[path] ?? (item ? { title: item.label } : { title: 'Page not found' })
}
