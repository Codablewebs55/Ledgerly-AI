// Specimen data for design-system docs only. Product screens get their data
// from the app's mock data layer (Stage 4), not from here.
import type { Status } from '@/ds'

export type SampleInvoice = {
  id: string
  number: string
  client: string
  issued: string
  due: string
  amount: number
  status: Status
}

export const sampleInvoices: SampleInvoice[] = [
  { id: 'inv-1042', number: 'INV-1042', client: 'Northwind Studio', issued: '2026-11-02', due: '2026-12-02', amount: 12480.5, status: 'sent' },
  { id: 'inv-1041', number: 'INV-1041', client: 'Harbor & Pine Co.', issued: '2026-10-28', due: '2026-11-12', amount: 3200, status: 'overdue' },
  { id: 'inv-1040', number: 'INV-1040', client: 'Atlas Logistics', issued: '2026-10-21', due: '2026-11-20', amount: 8915.25, status: 'paid' },
  { id: 'inv-1039', number: 'INV-1039', client: 'Mira Okafor', issued: '2026-10-18', due: '2026-11-18', amount: 1450, status: 'partial' },
  { id: 'inv-1038', number: 'INV-1038', client: 'Lumen Health', issued: '2026-10-15', due: '2026-11-21', amount: 22600, status: 'viewed' },
  { id: 'inv-1037', number: 'INV-1037', client: 'Copperleaf Bakery', issued: '2026-10-10', due: '—', amount: 640, status: 'draft' },
]

export const cashTrend = [42, 48, 45, 53, 51, 58, 62, 60, 67, 71, 69, 78]
export const revenueTrend = [18, 22, 21, 26, 24, 29, 31, 30, 34, 33, 37, 41]
export const expenseTrend = [30, 29, 31, 28, 27, 26, 27, 25, 24, 25, 23, 22]

export function formatDate(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
