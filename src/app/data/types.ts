// Domain types for the prototype's mock data layer.

export type Client = {
  id: string
  name: string
  email: string
  /** Default payment terms, in days. */
  terms: number
  /** Average days paid after the due date — feeds Ledgerly AI hints. */
  avgDaysLate: number
}

export type LineItem = {
  id: string
  description: string
  quantity: number
  rate: number
}

/** Stored lifecycle state. "overdue" and "due-soon" are derived from dates, never stored. */
export type StoredInvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'void'

export type InvoiceStatus = StoredInvoiceStatus | 'overdue' | 'due-soon'

export type Invoice = {
  id: string
  number: string
  clientId: string
  issueDate: string
  dueDate: string
  status: StoredInvoiceStatus
  items: LineItem[]
  /** Percentage, e.g. 8.875. */
  taxRate: number
  amountPaid: number
  paidDate?: string
  notes?: string
  createdAt: number
}

export type CashFlowMonth = {
  /** ISO month, e.g. "2026-11". */
  month: string
  moneyIn: number
  moneyOut: number
}
