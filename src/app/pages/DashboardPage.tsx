import { AlertTriangle, ArrowDownUp, ArrowRight, ArrowUpRight, BadgeDollarSign, FilePen, FileText, Landmark, Receipt, Sparkles, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  CashFlowChart,
  IconTile,
  MetricCard,
  Money,
  PageHeader,
  SegmentedControl,
  StatusBadge,
  Table,
  TaskList,
  type TaskItem,
  type Column,
  formatMoney,
} from '@/ds'
import { cx } from '@/ds/utils/cx'
import { clientById, clientName, daysBetween, formatDate, receivables, statusOf, totals, useInvoices } from '../data/invoices'
import { attention, cashBalanceTrend, cashFlow, TODAY } from '../data/seed'
import type { Invoice } from '../data/types'
import { useAssistant } from '../shell/assistant-context'
import { InvoiceRowActions } from './InvoiceRowActions'
import { currentUser } from '../shell/session'

const CASH_ON_HAND = 133912.4
const pctChange = (now: number, before: number) => (before ? ((now - before) / before) * 100 : 0)
const monthLabel = (m: string) => new Date(`${m}-01T00:00:00`).toLocaleDateString('en-US', { month: 'short' })

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

/** Comparison window shown in each KPI card's period chip. */
const COMPARE_PERIOD = { options: ['last month', 'last quarter', 'last year'] }

export default function DashboardPage() {
  const invoices = useInvoices()
  const r = useMemo(() => receivables(invoices), [invoices])
  const firstName = currentUser.name.split(' ')[0]
  const today = new Date(`${TODAY}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="flex flex-col gap-(--ldg-section-gap)">
      <PageHeader title={`${greeting()}, ${firstName}`} description={`Here's where ${currentUser.org} stands today, ${today}.`} />

      <section aria-label="Key figures" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          emphasis="hero"
          label="Cash on hand"
          icon={Wallet}
          value={<Money amount={CASH_ON_HAND} tone="inherit" />}
          delta={{ value: pctChange(cashBalanceTrend.at(-1)!, cashBalanceTrend.at(-2)!) }}
          period={COMPARE_PERIOD}
          trend={cashBalanceTrend}
        />
        <MetricCard
          label="Outstanding"
          icon={FileText}
          value={<Money amount={r.outstanding} tone="inherit" />}
          stat={{ label: 'Open invoices', value: r.outstandingCount, tone: 'info' }}
          period={COMPARE_PERIOD}
        />
        <MetricCard
          label="Overdue"
          icon={AlertTriangle}
          value={<Money amount={r.overdue} tone="inherit" className="text-fg-negative" />}
          stat={{ label: 'Past-due invoices', value: r.overdueCount, tone: 'negative' }}
          period={COMPARE_PERIOD}
        />
        <MetricCard
          label="Collected this month"
          icon={BadgeDollarSign}
          value={<Money amount={r.paidThisMonth} tone="inherit" />}
          delta={{ value: pctChange(r.paidThisMonth, r.paidLastMonth) }}
          period={COMPARE_PERIOD}
          trend={cashFlow.map((m) => m.moneyIn)}
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <CashFlowCard className="lg:col-span-2" />
        <InsightsCard />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <RecentInvoices invoices={invoices} className="lg:col-span-2" />
        <NeedsAttention overdueCount={r.overdueCount} overdue={r.overdue} drafts={invoices.filter((i) => i.status === 'draft').length} />
      </div>
    </div>
  )
}

// ── Cash flow ────────────────────────────────────────────────────────────

function CashFlowCard({ className }: { className?: string }) {
  const [range, setRange] = useState('6')
  const months = cashFlow.slice(-Number(range))
  const moneyIn = months.reduce((s, m) => s + m.moneyIn, 0)
  const moneyOut = months.reduce((s, m) => s + m.moneyOut, 0)
  const thisMonth = TODAY.slice(0, 7)

  return (
    <Card as="section" aria-labelledby="cashflow-title" className={cx('flex flex-col', className)}>
      <CardHeader
        id="cashflow-title"
        title="Cash flow"
        description="Money in and out of your business accounts"
        action={
          <SegmentedControl
            size="sm"
            aria-label="Cash flow period"
            value={range}
            onValueChange={setRange}
            options={[
              { value: '6', label: '6M' },
              { value: '12', label: '12M' },
            ]}
          />
        }
      />
      {/* Same full-bleed line-subtle rule as the MetricCard header; bleeds through the Card's md padding. */}
      <span aria-hidden className="-mx-5 mb-6 block h-px bg-line-subtle md:-mx-6" />
      <dl className="mb-5 grid grid-cols-2 items-end gap-4 pb-5 sm:grid-cols-3">
        <div className="col-span-2 sm:col-span-1">
          <dt className="flex items-center gap-2 text-caption text-fg-subtle">
            Net cash flow
            <IconTile icon={ArrowDownUp} />
          </dt>
          <dd className="mt-1 text-figure-lg">
            <Money amount={moneyIn - moneyOut} signed wholeUnits />
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 text-caption text-fg-subtle">
            Money in
            <IconTile icon={TrendingDown} tone="positive" />
          </dt>
          <dd className="mt-1.5 text-heading-md">
            <Money amount={moneyIn} wholeUnits tone="inherit" />
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 text-caption text-fg-subtle">
            Money out
            <IconTile icon={TrendingUp} tone="negative" />
          </dt>
          <dd className="mt-1.5 text-heading-md">
            <Money amount={moneyOut} wholeUnits tone="inherit" />
          </dd>
        </div>
      </dl>
      <CashFlowChart
        className="flex-1"
        aria-label={`Money in and out, last ${range} months`}
        data={months.map((m) => ({ label: monthLabel(m.month), moneyIn: m.moneyIn, moneyOut: m.moneyOut, partial: m.month === thisMonth }))}
      />
    </Card>
  )
}

// ── Ledgerly AI insights ─────────────────────────────────────────────────

function InsightsCard() {
  const assistant = useAssistant()
  const insights = useMemo(() => {
    const [sep, oct, nov] = cashFlow.slice(-3)
    const inChange = pctChange(oct.moneyIn, sep.moneyIn)
    const quarterProfit = oct.moneyIn - oct.moneyOut + (nov.moneyIn - nov.moneyOut)
    const setAside = Math.round((quarterProfit * 0.25) / 100) * 100
    const harbor = clientById('harbor')!
    return [
      {
        title: `${harbor.name} is ${daysBetween('2026-10-28', TODAY)} days late`,
        body: `INV-1041 for $3,200 was due Oct 28. They usually pay about ${harbor.avgDaysLate} days late — a friendly nudge now tends to land payment within a week.`,
        action: 'Draft a reminder',
        prompt: `Draft a friendly payment reminder to ${harbor.name} for INV-1041`,
      },
      {
        title: `October was your strongest month`,
        body: `Money in reached ${formatMoney(oct.moneyIn, { wholeUnits: true })}, up ${inChange.toFixed(0)}% on September, while spending grew more slowly.`,
        action: 'What drove it?',
        prompt: 'Explain what drove October’s cash flow',
      },
      {
        title: `Set aside about ${formatMoney(setAside, { wholeUnits: true })} for Q4 tax`,
        body: 'Based on profit so far this quarter at your 25% estimated rate.',
        action: 'Show the maths',
        prompt: 'How much should I set aside for tax this quarter?',
      },
    ]
  }, [])

  return (
    <Card as="section" tone="insight" aria-labelledby="insights-title" className="flex flex-col">
      <CardHeader variant="band" id="insights-title" icon={Sparkles} title="Ledgerly AI" description="3 things worth a look today" />

      <ul className="flex flex-1 flex-col divide-y divide-line-accent">
        {insights.map((i) => (
          <li key={i.title} className="py-3.5 first:pt-0">
            <p className="text-body-sm font-semibold">{i.title}</p>
            <p className="mt-1 text-caption text-fg-muted">{i.body}</p>
            <button
              type="button"
              onClick={() => assistant.ask(i.prompt)}
              className="mt-2 inline-flex cursor-pointer items-center gap-1 rounded-xs text-label font-semibold text-fg-brand hover:underline"
            >
              {i.action}
              <ArrowRight className="size-3.5" aria-hidden />
            </button>
          </li>
        ))}
      </ul>

      <Button variant="secondary" icon={Sparkles} fullWidth className="mt-2" onClick={assistant.open}>
        Ask about your books
      </Button>
    </Card>
  )
}

// ── Recent invoices ──────────────────────────────────────────────────────

const recentColumns: Column<Invoice>[] = [
  {
    key: 'client',
    header: 'Client',
    cell: (inv) => (
      <span className="flex items-center gap-3">
        <Avatar name={clientName(inv.clientId)} size="md" />
        <span className="min-w-0">
          <span className="block truncate font-medium">{clientName(inv.clientId)}</span>
          <span className="block text-caption text-fg-subtle">{inv.number}</span>
        </span>
      </span>
    ),
  },
  { key: 'due', header: 'Due', cell: (inv) => <span className="text-fg-muted">{formatDate(inv.dueDate)}</span>, hideBelow: 'xl' },
  { key: 'amount', header: 'Amount', align: 'end', cell: (inv) => <Money amount={totals(inv).total} className="font-medium" /> },
  { key: 'status', header: 'Status', align: 'end', cell: (inv) => <StatusBadge status={statusOf(inv)} /> },
]

function RecentInvoices({ invoices, className }: { invoices: Invoice[]; className?: string }) {
  const rows = [...invoices].sort((a, b) => b.issueDate.localeCompare(a.issueDate) || b.createdAt - a.createdAt).slice(0, 6)
  return (
    <Card as="section" padding="none" aria-labelledby="recent-title" className={cx('overflow-hidden', className)}>
      <CardHeader
        id="recent-title"
        title="Recent invoices"
        description="The last six you issued"
        inset
        action={
          <Button variant="ghost" size="sm" to="/app/invoices" icon={ArrowRight} iconPosition="end">
            View all
          </Button>
        }
      />
      <Table
        caption="Recent invoices"
        columns={recentColumns}
        rows={rows}
        rowKey={(r) => r.id}
        density="compact"
        rowActions={(inv) => <InvoiceRowActions inv={inv} />}
        embedded
        renderMobileRow={(inv) => (
          <div className="flex items-center gap-3">
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
      />
    </Card>
  )
}

// ── Needs attention ──────────────────────────────────────────────────────

function NeedsAttention({ overdueCount, overdue, drafts }: { overdueCount: number; overdue: number; drafts: number }) {
  const assistant = useAssistant()
  const items = ([
    { icon: AlertTriangle, tone: 'negative', title: `${overdueCount} overdue invoices`, meta: `${formatMoney(overdue)} waiting to be collected`, to: '/app/invoices?status=overdue' },
    { icon: Landmark, tone: 'warning', title: `${attention.unmatchedBankLines} bank transactions to match`, meta: 'Business Checking · since Friday', to: '/app/banking' },
    { icon: Receipt, tone: 'info', title: `${attention.receiptsMissing} receipts missing`, meta: 'Card spend over $75 this month', to: '/app/expenses' },
    { icon: FilePen, tone: 'neutral', title: `${drafts} draft ${drafts === 1 ? 'invoice' : 'invoices'} not sent`, meta: 'Review and send when ready', to: '/app/invoices?status=draft' },
  ] satisfies TaskItem[]).filter((i) => !i.title.startsWith('0 '))

  return (
    <Card as="section" padding="none" aria-labelledby="attention-title" className="flex flex-col">
      <CardHeader divider id="attention-title" title="Needs attention" description="Clear these to keep your books current" className="px-5 pt-5 md:px-6" />
      <TaskList items={items} className="px-2" />
      <div className="flex flex-col gap-2 px-5 pt-3 pb-5 md:px-6">
        <Button icon={ArrowUpRight} fullWidth to="/app/invoices?status=overdue">
          View issues
        </Button>
        <Button
          variant="secondary"
          icon={Sparkles}
          fullWidth
          onClick={() => assistant.ask('Help me resolve everything in Needs attention, starting with the overdue invoices')}
        >
          Resolve issues
        </Button>
      </div>
    </Card>
  )
}
