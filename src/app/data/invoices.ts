import { useSyncExternalStore } from 'react'
import { clients, seedInvoices, TODAY } from './seed'
import type { Client, Invoice, InvoiceStatus, LineItem } from './types'

// Invoice store: seeded once, then persisted in localStorage so created
// invoices survive a reload. No backend — this is the whole data layer.

const KEY = 'ledgerly:invoices:v2'
const DAY = 86_400_000

type Listener = () => void
const listeners = new Set<Listener>()
let cache: Invoice[] | null = null

function load(): Invoice[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Invoice[]
  } catch {
    // Unreadable or unavailable storage — fall back to the seed.
  }
  return seedInvoices()
}

function persist(next: Invoice[]) {
  cache = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Storage unavailable (private mode): changes last for this visit.
  }
  listeners.forEach((l) => l())
}

function getSnapshot() {
  return (cache ??= load())
}

function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Every invoice, newest first. Re-renders when one is added. */
export function useInvoices() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function addInvoice(invoice: Omit<Invoice, 'id' | 'createdAt'>) {
  const created: Invoice = { ...invoice, id: `inv-${invoice.number.replace(/\D/g, '')}-${Date.now().toString(36)}`, createdAt: Date.now() }
  persist([created, ...getSnapshot()])
  return created
}

/** Replaces the invoice with the same id, or adds it first. Used by draft autosave. */
export function saveInvoice(invoice: Invoice) {
  const list = getSnapshot()
  persist(list.some((i) => i.id === invoice.id) ? list.map((i) => (i.id === invoice.id ? invoice : i)) : [invoice, ...list])
  return invoice
}

export function nextInvoiceNumber(invoices: Invoice[]) {
  const max = invoices.reduce((m, i) => Math.max(m, Number(i.number.replace(/\D/g, '')) || 0), 1000)
  return `INV-${max + 1}`
}

// ── Derived values ───────────────────────────────────────────────────────

export const clientById = (id: string): Client | undefined => clients.find((c) => c.id === id)
export const clientName = (id: string) => clientById(id)?.name ?? 'Unknown client'

export const lineTotal = (li: Pick<LineItem, 'quantity' | 'rate'>) => round((li.quantity || 0) * (li.rate || 0))

export function totals(inv: Pick<Invoice, 'items' | 'taxRate' | 'amountPaid'>) {
  const subtotal = round(inv.items.reduce((s, li) => s + lineTotal(li), 0))
  const tax = round((subtotal * (inv.taxRate || 0)) / 100)
  const total = round(subtotal + tax)
  return { subtotal, tax, total, balance: round(total - (inv.amountPaid || 0)) }
}

/** Display status: unpaid invoices past due read "Overdue"; due within 7 days, "Due soon". */
export function statusOf(inv: Invoice, today = TODAY): InvoiceStatus {
  if (inv.status === 'draft' || inv.status === 'paid' || inv.status === 'void') return inv.status
  const days = daysBetween(today, inv.dueDate)
  if (days < 0) return 'overdue'
  if (days <= 7 && inv.status !== 'partial') return 'due-soon'
  return inv.status
}

/** Positive when `to` is after `from`. */
export function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY)
}

export function addDays(iso: string, days: number) {
  return new Date(Date.parse(`${iso}T00:00:00Z`) + days * DAY).toISOString().slice(0, 10)
}

export function formatDate(iso: string, opts: { year?: boolean } = {}) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: opts.year === false ? undefined : 'numeric' })
}

const isOpen = (s: InvoiceStatus) => s !== 'draft' && s !== 'paid' && s !== 'void'

/** Headline receivables figures for the dashboard and the invoice list. */
export function receivables(invoices: Invoice[], today = TODAY) {
  let outstanding = 0
  let outstandingCount = 0
  let overdue = 0
  let overdueCount = 0
  let paidThisMonth = 0
  let paidLastMonth = 0
  const month = today.slice(0, 7)
  const lastMonth = addDays(`${month}-01`, -1).slice(0, 7)
  for (const inv of invoices) {
    const s = statusOf(inv, today)
    const { balance } = totals(inv)
    if (isOpen(s)) {
      outstanding += balance
      outstandingCount++
    }
    if (s === 'overdue') {
      overdue += balance
      overdueCount++
    }
    if (inv.paidDate?.startsWith(month)) paidThisMonth += inv.amountPaid
    if (inv.paidDate?.startsWith(lastMonth)) paidLastMonth += inv.amountPaid
  }
  return { outstanding: round(outstanding), outstandingCount, overdue: round(overdue), overdueCount, paidThisMonth: round(paidThisMonth), paidLastMonth: round(paidLastMonth) }
}

function round(n: number) {
  return Math.round(n * 100) / 100
}
