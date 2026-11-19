import type { CashFlowMonth, Client, Invoice, LineItem } from './types'

// Seed data for the prototype. "Today" is fixed so the demo reads the same
// on every visit — overdue invoices stay overdue.
export const TODAY = '2026-11-18'

export const clients: Client[] = [
  { id: 'northwind', name: 'Northwind Studio', email: 'accounts@northwind.studio', terms: 30, avgDaysLate: 6 },
  { id: 'harbor', name: 'Harbor & Pine Co.', email: 'billing@harborandpine.com', terms: 15, avgDaysLate: 11 },
  { id: 'atlas', name: 'Atlas Logistics', email: 'ap@atlaslogistics.com', terms: 30, avgDaysLate: 0 },
  { id: 'mira', name: 'Mira Okafor', email: 'mira@okafor.design', terms: 30, avgDaysLate: 2 },
  { id: 'lumen', name: 'Lumen Health', email: 'finance@lumenhealth.co', terms: 45, avgDaysLate: 3 },
  { id: 'copperleaf', name: 'Copperleaf Bakery', email: 'hello@copperleaf.shop', terms: 15, avgDaysLate: 1 },
  { id: 'fieldnote', name: 'Fieldnote Media', email: 'ops@fieldnote.media', terms: 30, avgDaysLate: 4 },
  { id: 'orbit', name: 'Orbit Robotics', email: 'payables@orbitrobotics.io', terms: 60, avgDaysLate: 9 },
]

let seq = 0
const item = (description: string, quantity: number, rate: number): LineItem => ({ id: `seed-li-${++seq}`, description, quantity, rate })

type SeedRow = [number: number, clientId: string, issue: string, due: string, status: Invoice['status'], items: LineItem[], extra?: Partial<Invoice>]

const rows: SeedRow[] = [
  [1042, 'northwind', '2026-10-16', '2026-11-15', 'sent', [item('Brand system — phase 2', 1, 9800), item('Motion guidelines', 16, 167.53)]],
  [1041, 'harbor', '2026-10-13', '2026-10-28', 'sent', [item('Packaging redesign', 1, 3200)]],
  [1040, 'atlas', '2026-10-21', '2026-11-20', 'paid', [item('Fleet dashboard UX audit', 1, 6400), item('Usability sessions', 6, 419.21)], { amountPaid: 8915.26, paidDate: '2026-11-09' }],
  [1039, 'mira', '2026-10-18', '2026-11-17', 'partial', [item('Portfolio site build', 1, 2900)], { amountPaid: 1450 }],
  [1038, 'lumen', '2026-10-15', '2026-11-29', 'viewed', [item('Patient app — design sprint', 2, 11300)]],
  [1037, 'copperleaf', '2026-11-12', '2026-11-27', 'draft', [item('Menu and signage refresh', 1, 640)]],
  [1036, 'fieldnote', '2026-10-06', '2026-11-05', 'sent', [item('Podcast artwork series', 8, 225), item('Social cutdowns', 12, 85)]],
  [1035, 'orbit', '2026-09-25', '2026-11-24', 'viewed', [item('Investor deck', 1, 7200), item('Product renders', 10, 310)]],
  [1034, 'northwind', '2026-10-01', '2026-10-31', 'paid', [item('Brand system — phase 1', 1, 11250)], { amountPaid: 11250, paidDate: '2026-11-03' }],
  [1033, 'lumen', '2026-09-30', '2026-11-14', 'paid', [item('Research synthesis', 1, 4800)], { amountPaid: 4800, paidDate: '2026-11-13' }],
  [1032, 'atlas', '2026-09-22', '2026-10-22', 'paid', [item('Driver app onboarding', 1, 5650)], { amountPaid: 5650, paidDate: '2026-10-20' }],
  [1031, 'harbor', '2026-09-15', '2026-09-30', 'paid', [item('Label system', 1, 2400)], { amountPaid: 2400, paidDate: '2026-10-14' }],
  [1030, 'mira', '2026-09-10', '2026-10-10', 'paid', [item('Identity consultation', 4, 180)], { amountPaid: 720, paidDate: '2026-10-09' }],
  [1029, 'fieldnote', '2026-09-02', '2026-10-02', 'paid', [item('Season 3 key art', 1, 3100)], { amountPaid: 3100, paidDate: '2026-10-05' }],
  [1028, 'copperleaf', '2026-08-28', '2026-09-12', 'void', [item('Holiday campaign (cancelled)', 1, 1200)]],
  [1027, 'orbit', '2026-08-20', '2026-10-19', 'paid', [item('Website art direction', 1, 9400)], { amountPaid: 9400, paidDate: '2026-10-27' }],
  [1026, 'lumen', '2026-08-14', '2026-09-28', 'paid', [item('Discovery workshop', 2, 2600)], { amountPaid: 5200, paidDate: '2026-09-30' }],
  [1025, 'northwind', '2026-08-03', '2026-09-02', 'paid', [item('Naming exploration', 1, 3800)], { amountPaid: 3800, paidDate: '2026-09-08' }],
]

export function seedInvoices(): Invoice[] {
  return rows.map(([n, clientId, issueDate, dueDate, status, items, extra], i) => ({
    id: `inv-${n}`,
    number: `INV-${n}`,
    clientId,
    issueDate,
    dueDate,
    status,
    items,
    taxRate: 0,
    amountPaid: 0,
    createdAt: rows.length - i,
    ...extra,
  }))
}

/** Twelve months of bank-level money in / out, oldest first. November is month to date. */
export const cashFlow: CashFlowMonth[] = [
  { month: '2025-12', moneyIn: 21400, moneyOut: 16900 },
  { month: '2026-01', moneyIn: 18750, moneyOut: 17300 },
  { month: '2026-02', moneyIn: 24100, moneyOut: 16200 },
  { month: '2026-03', moneyIn: 26800, moneyOut: 18450 },
  { month: '2026-04', moneyIn: 22300, moneyOut: 17100 },
  { month: '2026-05', moneyIn: 29400, moneyOut: 19800 },
  { month: '2026-06', moneyIn: 27650, moneyOut: 18900 },
  { month: '2026-07', moneyIn: 31200, moneyOut: 20400 },
  { month: '2026-08', moneyIn: 28900, moneyOut: 19650 },
  { month: '2026-09', moneyIn: 33450, moneyOut: 21200 },
  { month: '2026-10', moneyIn: 36120, moneyOut: 22780 },
  { month: '2026-11', moneyIn: 24965, moneyOut: 14310 },
]

/** Business checking + savings, end of each of the last 12 months. */
export const cashBalanceTrend = [52.1, 54.6, 53.1, 61.0, 69.3, 74.5, 82.1, 88.8, 97.7, 109.9, 123.3, 133.9]

/** Things outside invoicing that need a decision — counts mirror the nav badges. */
export const attention = {
  unmatchedBankLines: 5,
  receiptsMissing: 3,
}
