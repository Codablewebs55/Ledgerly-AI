import { Copy, Download, Eye, FileText, Plus, Search, Send } from 'lucide-react'
import { useState } from 'react'
import { Avatar, Button, EmptyState, FilterMenu, Input, MenuItem, MenuSeparator, Money, Pagination, RowActions, SortMenu, StatusBadge, Table, Tabs, useToast, type Column, type SortState } from '@/ds'
import { formatDate, sampleInvoices, type SampleInvoice } from '../sample-data'
import { Decision, DocRow, DocSection } from '../docs'

const columns: Column<SampleInvoice>[] = [
  {
    key: 'client',
    header: 'Client',
    sortValue: (r) => r.client,
    cell: (r) => (
      <span className="flex items-center gap-3">
        <Avatar name={r.client} size="sm" />
        <span className="font-medium text-fg">{r.client}</span>
      </span>
    ),
  },
  { key: 'number', header: 'Invoice', cell: (r) => <span className="figure whitespace-nowrap text-fg-muted">{r.number}</span> },
  { key: 'issued', header: 'Issued', hideBelow: 'lg', sortValue: (r) => r.issued, cell: (r) => <span className="figure whitespace-nowrap text-fg-muted">{formatDate(r.issued)}</span> },
  { key: 'due', header: 'Due', sortValue: (r) => r.due, cell: (r) => <span className="figure whitespace-nowrap text-fg-muted">{formatDate(r.due)}</span> },
  { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} size="sm" /> },
  { key: 'amount', header: 'Amount', align: 'end', sortValue: (r) => r.amount, cell: (r) => <Money amount={r.amount} className="font-medium text-fg" /> },
]

function MobileRow({ r }: { r: SampleInvoice }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-body-sm font-medium">{r.client}</p>
        <p className="figure mt-0.5 text-caption text-fg-subtle">
          {r.number} · Due {formatDate(r.due)}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <Money amount={r.amount} className="text-body-sm font-semibold" />
        <StatusBadge status={r.status} size="sm" />
      </div>
    </div>
  )
}

export default function TablesSection() {
  const toast = useToast()
  return (
    <DocSection
      id="tables"
      title="Tables"
      intro="Where accountants spend their day. Sortable, keyboard-navigable, and redesigned for phones instead of squeezed onto them."
    >
      <DocRow layout="stack" name="Data table" description="Click a header to sort. Every sortable header carries the same up-down icon to the right of its label, even on right-aligned columns; the sorted column turns dark. Rows open the record. Below 768px each row becomes a two-line summary: who, what, how much and status.">
        <Table
          caption="Recent invoices"
          columns={columns}
          rows={sampleInvoices}
          rowKey={(r) => r.id}
          initialSort={{ key: 'issued', dir: 'desc' }}
          highlightKey="inv-1042"
          onRowClick={(r) => toast.show({ title: `Opening ${r.number}`, description: 'Invoice detail arrives in Stage 5.', tone: 'info' })}
          renderMobileRow={(r) => <MobileRow r={r} />}
        />
      </DocRow>

      <DocRow
        layout="stack"
        name="Row actions"
        description="rowActions adds a trailing, right-aligned Actions column. Each row gets a RowActions menu: a 32px round outlined ••• button (14px icon) that opens a list of MenuItems. The menu is positioned against the viewport, so it is never clipped by the table or card, and it flips above the button near the bottom of the screen. On phones the button sits at the end of each row."
      >
        <Table
          caption="Invoices with actions"
          density="compact"
          columns={columns.filter((c) => ['client', 'due', 'amount', 'status'].includes(c.key)).map((c) => (c.key === 'status' ? { ...c, align: 'end' as const } : c))}
          rows={sampleInvoices.slice(0, 4)}
          rowKey={(r) => r.id}
          rowActions={(r) => (
            <RowActions label={`Actions for ${r.number}`}>
              <MenuItem icon={Eye}>View invoice</MenuItem>
              <MenuItem icon={Send}>Send reminder</MenuItem>
              <MenuItem icon={Download}>Download PDF</MenuItem>
              <MenuSeparator />
              <MenuItem icon={Copy}>Duplicate</MenuItem>
            </RowActions>
          )}
          renderMobileRow={(r) => <MobileRow r={r} />}
        />
      </DocRow>

      <DocRow
        layout="stack"
        name="Table header"
        description="A list table sits in a padding-none Card under a header row: status Tabs on the left, then a small (32px) search field, the SortMenu and a running total on the right. The header has 8px of space above it (pt-2) and 24px side padding (20px on phones), and the tabs' underline sits on the table's top rule. Below 1024px the search and sort stack above the tabs. Inside the card the Table takes `embedded`, which drops its own radius and side borders and keeps only the top rule."
      >
        <TableHeaderDemo />
      </DocRow>

      <DocRow
        layout="stack"
        name="Filter menu"
        description="A single-choice dropdown that scopes a list, such as a date range. It sits immediately left of Export in the page header: a 40px filled (surface-sunken) trigger with the chosen label and a chevron, no border, so it reads as a quiet setting beside outlined buttons. The chosen option carries a check in the menu."
      >
        <FilterMenuDemo />
      </DocRow>

      <DocRow layout="stack" name="Compact & empty" description="Compact density for side panels. An empty table always says why it's empty and what to do next.">
        <Table
          caption="Invoices due this week"
          density="compact"
          columns={columns.filter((c) => ['client', 'due', 'amount'].includes(c.key))}
          rows={sampleInvoices.slice(0, 3)}
          rowKey={(r) => r.id}
        />
        <Table
          caption="Draft invoices"
          columns={columns}
          rows={[]}
          rowKey={(r) => r.id}
          empty={
            <EmptyState
              size="sm"
              icon={FileText}
              title="No drafts"
              description="Invoices you save without sending will wait here."
              actions={<Button size="sm" icon={Plus}>New invoice</Button>}
            />
          }
        />
      </DocRow>

      <DocRow layout="stack" name="Pagination" description="Under a long table: how many rows are showing out of how many, and page controls. Phones keep only Previous and Next.">
        <PaginationDemo />
      </DocRow>

      <Decision>
        Amounts are always the last, right-aligned column. Eyes scan down a single edge of digits, the same way they read a paper
        ledger. The just-created invoice is highlighted so people can confirm their action landed. Secondary actions live in one
        overflow menu per row instead of a row of buttons, so the figures stay the loudest thing in the table.
      </Decision>
    </DocSection>
  )
}

const sortOptions = [
  { key: 'issued', label: 'Issue date' },
  { key: 'due', label: 'Due date' },
  { key: 'amount', label: 'Amount' },
  { key: 'client', label: 'Client' },
]

function TableHeaderDemo() {
  const [tab, setTab] = useState('all')
  const [sort, setSort] = useState<SortState>({ key: 'issued', dir: 'desc' })
  const rows = sampleInvoices.slice(0, 3)
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex flex-col gap-3 px-5 pt-2 md:px-6 lg:flex-row lg:items-center lg:gap-6">
        <Tabs
          aria-label="Filter invoices by status"
          idPrefix="doc-invoice-status"
          value={tab}
          onValueChange={setTab}
          items={[
            { id: 'all', label: 'All', count: 18 },
            { id: 'draft', label: 'Drafts', count: 1 },
            { id: 'overdue', label: 'Overdue', count: 4 },
          ]}
          className="order-last lg:order-none lg:self-end"
        />
        <div className="flex min-w-0 items-center gap-3 lg:ml-auto">
          <Input type="search" size="sm" icon={Search} aria-label="Search invoices" placeholder="Search invoices" fieldClassName="min-w-0 flex-1 lg:w-60 lg:flex-none" />
          <SortMenu label="Sort invoices" options={sortOptions} value={sort} onChange={setSort} />
        </div>
      </div>
      <Table
        caption="Invoices"
        density="compact"
        columns={columns.filter((c) => ['client', 'due', 'amount'].includes(c.key))}
        rows={rows}
        rowKey={(r) => r.id}
        sort={sort}
        onSortChange={setSort}
        embedded
      />
    </div>
  )
}

const periods = [
  { value: '30', label: 'Past 30 days' },
  { value: '90', label: 'Past 90 days' },
  { value: '365', label: 'Past 12 months' },
  { value: 'all', label: 'All time' },
]

function FilterMenuDemo() {
  const toast = useToast()
  const [period, setPeriod] = useState('90')
  return (
    <div className="flex flex-wrap items-center gap-3">
      <FilterMenu label="Date range" options={periods} value={period} onChange={setPeriod} />
      <Button variant="secondary" icon={Download} onClick={() => toast.show({ tone: 'info', title: 'Export is outside this prototype' })}>
        Export
      </Button>
    </div>
  )
}

function PaginationDemo() {
  const [page, setPage] = useState(1)
  return (
    <div className="rounded-lg border border-line bg-surface px-5 py-3">
      <Pagination page={page} pageSize={8} total={42} onPageChange={setPage} noun="invoices" />
    </div>
  )
}
