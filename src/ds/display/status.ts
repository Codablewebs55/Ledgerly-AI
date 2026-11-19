import type { BadgeTone } from './Badge'

/**
 * Every lifecycle state in the product, mapped once to a label and tone so
 * "Overdue" looks identical on the dashboard, the list and the detail page.
 */
export const statusMeta = {
  // Invoices
  draft: { label: 'Draft', tone: 'draft' },
  scheduled: { label: 'Scheduled', tone: 'brand' },
  sent: { label: 'Sent', tone: 'info' },
  viewed: { label: 'Viewed', tone: 'info' },
  partial: { label: 'Partially paid', tone: 'warning' },
  'due-soon': { label: 'Due soon', tone: 'warning' },
  paid: { label: 'Paid', tone: 'positive' },
  overdue: { label: 'Overdue', tone: 'negative' },
  void: { label: 'Void', tone: 'neutral' },
  // Expenses
  pending: { label: 'Pending review', tone: 'warning' },
  approved: { label: 'Approved', tone: 'positive' },
  rejected: { label: 'Rejected', tone: 'negative' },
  // Bank reconciliation
  matched: { label: 'Matched', tone: 'positive' },
  suggested: { label: 'Suggested match', tone: 'accent' },
  unmatched: { label: 'Needs review', tone: 'warning' },
  excluded: { label: 'Excluded', tone: 'neutral' },
} as const satisfies Record<string, { label: string; tone: BadgeTone }>

export type Status = keyof typeof statusMeta
