import { ArrowLeftRight, CircleHelp, Landmark, PieChart, Receipt, Settings, Users } from 'lucide-react'
import type { IconComponent } from '@/ds'

export type PageDef = {
  title: string
  description: string
  icon: IconComponent
  stage: string
  back?: { label: string; to: string }
  layout?: 'metrics' | 'list' | 'form'
}

export const shellPages = {
  expenses: { title: 'Expenses', description: 'Receipts, bills and spending by category.', icon: Receipt, stage: '5', layout: 'list' },
  transactions: { title: 'Transactions', description: 'Every money movement across your connected accounts.', icon: ArrowLeftRight, stage: '5', layout: 'list' },
  banking: { title: 'Banking', description: 'Match bank transactions to your books.', icon: Landmark, stage: '5', layout: 'list' },
  reports: { title: 'Reports', description: 'Profit and loss, balance sheet and cash flow.', icon: PieChart, stage: '5', layout: 'metrics' },
  customers: { title: 'Customers', description: 'The people and businesses you invoice.', icon: Users, stage: '5', layout: 'list' },
  settings: { title: 'Settings', description: 'Business details, invoice defaults and notifications.', icon: Settings, stage: '5', layout: 'form' },
  help: { title: 'Help', description: 'Guides, answers and a way to reach the Ledgerly team.', icon: CircleHelp, stage: '5', layout: 'list' },
} satisfies Record<string, PageDef>
