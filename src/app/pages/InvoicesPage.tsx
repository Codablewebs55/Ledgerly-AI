import { Download, FileText, Plus, Search, SearchX } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  FilterMenu,
  Input,
  Money,
  PageHeader,
  Pagination,
  SortMenu,
  StatusBadge,
  Table,
  Tabs,
  useToast,
  type Column,
  type SortState,
} from '@/ds'
import { clientById, clientName, daysBetween, formatDate, receivables, statusOf, totals, useInvoices } from '../data/invoices'
import { TODAY } from '../data/seed'
import type { Invoice, InvoiceStatus } from '../data/types'
import { InvoiceRowActions } from './InvoiceRowActions'

const PAGE_SIZE = 8

const periods = [
  { value: '30', label: 'Past 30 days' },
  { value: '90', label: 'Past 90 days' },
  { value: '365', label: 'Past 12 months' },
  { value: 'all', label: 'All time' },
]

type TabId = 'all' | 'draft' | 'awaiting' | 'overdue' | 'paid'

const tabMatch: Record<TabId, (s: InvoiceStatus) => boolean> = {
  all: () => true,
  draft: (s) => s === 'draft',
  awaiting: (s) => s === 'sent' || s === 'viewed' || s === 'partial' || s === 'due-soon',
  overdue: (s) => s === 'overdue',
  paid: (s) => s === 'paid',
}

const tabLabels: Record<TabId, string> = {
  all: 'All',
  draft: 'Drafts',
  awaiting: 'Awaiting payment',
  overdue: 'Overdue',
  paid: 'Paid',
}

const sortOptions = [
  { key: 'issued', label: 'Issue date' },
  { key: 'due', label: 'Due date' },
  { key: 'amount', label: 'Amount' },
  { key: 'client', label: 'Client' },
  { key: 'number', label: 'Invoice number' },
  { key: 'status', label: 'Status' },
]

const isTab = (v: string | null): v is TabId => !!v && v in tabMatch

const columns: Column<Invoice>[] = [
  {
    key: 'number',
    header: 'Invoice',
    sortValue: (inv) => inv.number,
    width: 'w-32',
    cell: (inv) => <span className="figure font-medium">{inv.number}</span>,
  },
  {
    key: 'client',
    header: 'Client',
    sortValue: (inv) => clientName(inv.clientId),
    cell: (inv) => (
      <span className="flex items-center gap-3">
        <Avatar name={clientName(inv.clientId)} size="md" />
        <span className="min-w-0">
          <span className="block truncate font-medium">{clientName(inv.clientId)}</span>
          <span className="block truncate text-caption text-fg-subtle">{clientById(inv.clientId)?.email}</span>
        </span>
      </span>
    ),
  },
  {
    key: 'issued',
    header: 'Issued',
    sortValue: (inv) => inv.issueDate,
    hideBelow: 'xl',
    cell: (inv) => <span className="text-fg-muted">{formatDate(inv.issueDate)}</span>,
  },
  {
    key: 'due',
    header: 'Due',
    sortValue: (inv) => inv.dueDate,
    cell: (inv) => <DueCell inv={inv} />,
  },
  {
    key: 'amount',
    header: 'Amount',
    align: 'end',
    sortValue: (inv) => totals(inv).total,
    cell: (inv) => {
      const { total, balance } = totals(inv)
      return (
        <span className="flex flex-col items-end">
          <Money amount={total} className="font-medium" />
          {balance > 0 && balance < total && (
            <span className="text-caption text-fg-subtle">
              <Money amount={balance} tone="inherit" /> left
            </span>
          )}
        </span>
      )
    },
  },
  {
    key: 'status',
    header: 'Status',
    align: 'end',
    width: 'w-40',
    sortValue: (inv) => statusOf(inv),
    cell: (inv) => <StatusBadge status={statusOf(inv)} />,
  },
]

function DueCell({ inv }: { inv: Invoice }) {
  const s = statusOf(inv)
  const days = daysBetween(TODAY, inv.dueDate)
  return (
    <span className="flex flex-col">
      <span className="text-fg-muted">{formatDate(inv.dueDate)}</span>
      {s === 'overdue' && (
        <span className="text-caption font-medium text-fg-negative">
          {-days} {days === -1 ? 'day' : 'days'} late
        </span>
      )}
      {s === 'due-soon' && (
        <span className="text-caption text-fg-warning">
          in {days} {days === 1 ? 'day' : 'days'}
        </span>
      )}
    </span>
  )
}

export default function InvoicesPage() {
  const invoices = useInvoices()
  const { show } = useToast()
  const [params, setParams] = useSearchParams()
  const tab: TabId = isTab(params.get('status')) ? (params.get('status') as TabId) : 'all'
  const created = params.get('created')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<SortState>({ key: 'issued', dir: 'desc' })
  const [period, setPeriod] = useState('90')

  const r = useMemo(() => receivables(invoices), [invoices])

  // The period scopes the list by issue date; the summary above stays account-wide.
  const inPeriod = useMemo(
    () => (period === 'all' ? invoices : invoices.filter((inv) => daysBetween(inv.issueDate, TODAY) <= Number(period))),
    [invoices, period],
  )

  const counts = useMemo(() => {
    const c = { all: 0, draft: 0, awaiting: 0, overdue: 0, paid: 0 } as Record<TabId, number>
    for (const inv of inPeriod) {
      const s = statusOf(inv)
      for (const id of Object.keys(tabMatch) as TabId[]) if (tabMatch[id](s)) c[id]++
    }
    return c
  }, [inPeriod])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const col = columns.find((c) => c.key === sort.key)
    const dir = sort.dir === 'asc' ? 1 : -1
    return inPeriod
      .filter((inv) => tabMatch[tab](statusOf(inv)))
      .filter((inv) => !q || inv.number.toLowerCase().includes(q) || clientName(inv.clientId).toLowerCase().includes(q))
      .sort((a, b) => {
        const av = col?.sortValue?.(a) ?? 0
        const bv = col?.sortValue?.(b) ?? 0
        return (av < bv ? -1 : av > bv ? 1 : b.createdAt - a.createdAt) * dir
      })
  }, [inPeriod, tab, query, sort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const setTab = (id: string) => {
    setPage(1)
    setParams(
      (p) => {
        if (id === 'all') p.delete('status')
        else p.set('status', id)
        p.delete('created')
        return p
      },
      { replace: true },
    )
  }

  const changeSort = (next: SortState) => {
    setSort(next)
    setPage(1)
  }

  const createdInvoice = created ? invoices.find((i) => i.id === created) : undefined

  return (
    <div className="flex flex-col gap-(--ldg-section-gap)">
      <PageHeader
        title="Invoices"
        description="Create, send and track every invoice in one place."
        actions={
          <>
            <FilterMenu
              label="Date range"
              options={periods}
              value={period}
              onChange={(v) => {
                setPeriod(v)
                setPage(1)
              }}
            />
            <Button
              variant="secondary"
              icon={Download}
              onClick={() =>
                show({
                  tone: 'info',
                  title: 'Export is outside this prototype',
                  description: 'CSV and PDF exports arrive with the reports stage.',
                })
              }
            >
              Export
            </Button>
          </>
        }
      />

      {createdInvoice && (
        <Alert
          tone="positive"
          title={`${createdInvoice.number} ${createdInvoice.status === 'draft' ? 'saved as a draft' : `sent to ${clientName(createdInvoice.clientId)}`}`}
          onDismiss={() =>
            setParams(
              (p) => {
                p.delete('created')
                return p
              },
              { replace: true },
            )
          }
        >
          {createdInvoice.status === 'draft'
            ? 'It stays private until you send it.'
            : `We emailed ${clientById(createdInvoice.clientId)?.email} with a link to view and pay.`}
        </Alert>
      )}

      {/* Summary and list read as one unit, so they sit closer than the page's section gap. */}
      <div className="flex flex-col gap-4">
        <Card padding="none" as="section" aria-label="Receivables summary">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-line-subtle lg:grid-cols-4">
            <Stat label="Outstanding" value={<Money amount={r.outstanding} tone="inherit" />} note={`${r.outstandingCount} open invoices`} />
            <Stat label="Overdue" value={<Money amount={r.overdue} className="text-fg-negative" tone="inherit" />} note={`${r.overdueCount} past due date`} />
            <Stat label="Collected this month" value={<Money amount={r.paidThisMonth} tone="inherit" />} note="November to date" />
            <Stat label="Average time to pay" value="27 days" note="Last 90 days" trend="3 days faster" />
          </dl>
        </Card>

        <Card padding="none" as="section" aria-label="Invoice list" className="overflow-hidden">
          {/* Toolbar: tabs on the left (their underline sits on the table's top rule), search + sort + total on the right. */}
          <div className="flex flex-col gap-3 px-5 pt-2 md:px-6 lg:flex-row lg:items-center lg:gap-6">
            <Tabs
              aria-label="Filter invoices by status"
              idPrefix="invoice-status"
              value={tab}
              onValueChange={setTab}
              items={(Object.keys(tabLabels) as TabId[]).map((id) => ({
                id,
                label: tabLabels[id],
                count: counts[id],
              }))}
              className="order-last lg:order-none lg:self-end"
            />
            <div className="flex min-w-0 items-center gap-3 lg:ml-auto">
              <Input
                type="search"
                size="sm"
                icon={Search}
                aria-label="Search invoices"
                placeholder="Search client or invoice #"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(1)
                }}
                fieldClassName="min-w-0 flex-1 lg:w-72 lg:flex-none"
              />
              <SortMenu label="Sort invoices" options={sortOptions} value={sort} onChange={changeSort} />
              <p className="hidden shrink-0 text-caption text-fg-subtle sm:block">
                Total shown:&nbsp;
                <Money amount={filtered.reduce((s, inv) => s + totals(inv).total, 0)} className="font-semibold text-fg" tone="inherit" />
              </p>
            </div>
          </div>

          <Table
            caption={`${tabLabels[tab]} invoices`}
            columns={columns}
            rows={rows}
            rowKey={(inv) => inv.id}
            sort={sort}
            onSortChange={changeSort}
            density="compact"
            rowActions={(inv) => <InvoiceRowActions inv={inv} />}
            highlightKey={created ?? undefined}
            embedded
            renderMobileRow={(inv) => (
              <div className="flex items-start gap-3">
                <Avatar name={clientName(inv.clientId)} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body-sm font-medium">{clientName(inv.clientId)}</p>
                  <p className="text-caption text-fg-subtle">
                    {inv.number} · Due {formatDate(inv.dueDate, { year: false })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Money amount={totals(inv).total} className="text-body-sm font-medium" />
                  <StatusBadge status={statusOf(inv)} size="sm" />
                </div>
              </div>
            )}
            empty={
              query ? (
                <EmptyState
                  size="sm"
                  icon={SearchX}
                  title="No invoices match your search"
                  description={`Nothing in ${tabLabels[tab].toLowerCase()} matches “${query}”. Try a client name or an invoice number like INV-1041.`}
                  actions={
                    <Button variant="secondary" onClick={() => setQuery('')}>
                      Clear search
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  size="sm"
                  icon={FileText}
                  title={tab === 'overdue' ? 'Nothing is overdue' : `No ${tabLabels[tab].toLowerCase()} invoices`}
                  description={tab === 'overdue' ? 'Every client is paying on time. Nice.' : 'Invoices you create will appear here.'}
                  actions={
                    <Button to="/app/invoices/new" icon={Plus}>
                      Create invoice
                    </Button>
                  }
                />
              )
            }
          />

          {filtered.length > 0 && (
            <Pagination
              page={current}
              pageSize={PAGE_SIZE}
              total={filtered.length}
              onPageChange={setPage}
              noun="invoices"
              className="border-t border-line-subtle px-5 py-3 md:px-6"
            />
          )}
        </Card>
      </div>
    </div>
  )
}

function Stat({ label, value, note, trend }: { label: string; value: ReactNode; note: string; trend?: string }) {
  return (
    <div className="bg-surface px-5 py-4 md:px-6">
      <dt className="text-caption text-fg-subtle">{label}</dt>
      <dd className="mt-1 text-figure-lg">{value}</dd>
      {/* Context sits in a muted pill; a positive trend follows it in green */}
      <dd className="mt-1.5 flex flex-wrap items-center gap-1.5 text-caption">
        <Badge tone="muted">{note}</Badge>
        {trend && <span className="text-label font-normal text-fg-positive">{trend}</span>}
      </dd>
    </div>
  )
}
