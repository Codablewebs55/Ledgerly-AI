import { AlertTriangle, ArrowUpRight, FilePen, FileText, Landmark, Receipt, Sparkles, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { Avatar, Button, Card, CardHeader, CashFlowChart, IconTile, MetricCard, Money, Sparkline, TaskList } from '@/ds'
import { cashTrend, expenseTrend, revenueTrend } from '../sample-data'
import { Decision, Demo, DocRow, DocSection } from '../docs'

export default function CardsSection() {
  return (
    <DocSection
      id="cards"
      title="Cards & metrics"
      intro="Surfaces that group related content, and the KPI tiles that sit at the top of every financial view."
    >
      <DocRow layout="stack" name="Metric cards" description="Label, figure, change and trend, with an edge-to-edge hairline (line-subtle) between the label row and the figure. The label row sits in a compact header band (16px above, 12px below). The delta colour means good or bad, not up or down, so falling expenses read green. The delta pill sits on its own line 8px above its comparison label. Snapshot cards swap the delta for a stat row: a bordered box under the figure with the breakdown label on the left and its count in a chip (info blue for neutral context, negative red when the figure is a problem), with the caption underneath. Where the comparison window is switchable, a sunken dropdown chip (“last month ⌄”, 13px label with the chevron tight beside it) replaces the caption, under either the delta pill or the stat row. Stat cards carry no sparkline; the trend is reserved for cards with a delta. The header icon sits in a sunken 32px tile and is drawn in fg-icon (sand-700, #524c40). The headline KPI (hero) is white with a 2px forest outline, one per view.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            className="sm:col-span-2 lg:col-span-1"
            emphasis="hero"
            label="Cash balance"
            value={<Money amount={184250} />}
            delta={{ value: 8.2 }}
            period={{ options: ['last month', 'last quarter', 'last year'] }}
            trend={cashTrend}
            icon={Wallet}
          />
          <MetricCard
            label="Revenue · Nov"
            value={<Money amount={48920.4} />}
            delta={{ value: 12.4, label: 'vs Oct' }}
            trend={revenueTrend}
            icon={TrendingUp}
          />
          <MetricCard
            label="Expenses · Nov"
            value={<Money amount={21305.12} />}
            delta={{ value: -6.1, label: 'vs Oct', increaseIsGood: false }}
            trend={expenseTrend}
            icon={Receipt}
          />
          <MetricCard
            label="Outstanding"
            value={<Money amount={52850.48} />}
            stat={{ label: 'Open invoices', value: 6, tone: 'info' }}
            period={{ options: ['last month', 'last quarter', 'last year'] }}
            icon={FileText}
          />
          <MetricCard
            label="Overdue"
            value={<Money amount={7470} />}
            stat={{ label: 'Past-due invoices', value: 3, tone: 'negative' }}
            period={{ options: ['last month', 'last quarter', 'last year'] }}
            icon={AlertTriangle}
          />
        </div>
      </DocRow>

      <DocRow layout="stack" name="Card tones" description="Default for most content. Sunken for secondary groups. Inverse for the one hero moment. Emphasis (2px line-brand border) marks the one highlighted card in a set, e.g. the hero metric. Inverse-raised sits on a forest band, such as marketing quotes. Insight is reserved for the AI assistant and opens with a band header (the CardHeader band variant): a full-bleed accent-muted strip with a forest icon tile, title and caption. Radius is lg (12px) in the app; xl and 2xl are the marketing card and product-frame radii.">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader title="Outstanding receivables" description="6 open invoices" icon={Landmark} action={<Button size="sm" variant="ghost">View all</Button>} />
            <Money amount={37385.75} className="text-figure-lg" />
          </Card>
          <Card tone="sunken">
            <CardHeader title="Upcoming bills" description="Next 14 days" />
            <Money amount={8640} className="text-figure-lg" />
          </Card>
          <Card tone="inverse">
            <p className="text-label text-fg-inverse-muted">Net profit · Q4 to date</p>
            <p className="mt-2 text-figure-xl figure text-fg-inverse-accent">+$62,118</p>
          </Card>
          <Card tone="insight">
            <CardHeader variant="band" icon={Sparkles} title="Ledgerly AI" description="3 things worth a look today" />
            <p className="text-body-sm font-semibold">Ledgerly assistant</p>
            <p className="mt-1 text-body-sm text-fg-muted">Two clients usually pay 9 days late. Sending reminders now could bring $15,680 in by Friday.</p>
          </Card>
          <Card tone="emphasis">
            <CardHeader title="Cash on hand" description="Emphasis · one per set" />
            <Money amount={133912.4} className="text-figure-lg" />
          </Card>
          <div className="rounded-xl bg-inverse p-4">
            <Card tone="inverse-raised" radius="xl">
              <p className="text-body-sm text-fg-inverse">“Now Ledgerly tells me first.”</p>
              <p className="mt-1 text-caption text-fg-inverse-muted">Inverse-raised · radius xl, on a forest band</p>
            </Card>
          </div>
        </div>
      </DocRow>

      <DocRow name="Money & figures" description="Every amount uses Money: tabular figures, a true minus sign, and colour only where the sign carries meaning.">
        <Demo label="default">
          <Money amount={12480.5} className="text-figure-md" />
          <Money amount={-3200} className="text-figure-md" />
        </Demo>
        <Demo label="signed">
          <Money amount={1840} signed className="text-figure-md" />
          <Money amount={-420.75} signed className="text-figure-md" />
        </Demo>
        <Demo label="compact">
          <Money amount={184250} compact className="text-figure-md" />
          <Money amount={1240000} compact className="text-figure-md" />
        </Demo>
        <Demo label="sparkline">
          <Sparkline values={cashTrend} />
          <Sparkline values={expenseTrend} tone="negative" />
        </Demo>
      </DocRow>

      <DocRow
        layout="stack"
        name="Cash flow chart"
        description="Money in (forest) against money out (bg-accent lime) per month. A hatched bar marks a month still in progress. Hover or focus a month for exact figures and net. Always pair it with a headline net figure."
      >
        <Card>
          <CashFlowChart
            aria-label="Money in and out, last 6 months"
            data={[
              { label: 'Jun', moneyIn: 27650, moneyOut: 18900 },
              { label: 'Jul', moneyIn: 31200, moneyOut: 20400 },
              { label: 'Aug', moneyIn: 28900, moneyOut: 19650 },
              { label: 'Sep', moneyIn: 33450, moneyOut: 21200 },
              { label: 'Oct', moneyIn: 36120, moneyOut: 22780 },
              { label: 'Nov', moneyIn: 24965, moneyOut: 14310, partial: true },
            ]}
          />
        </Card>
      </DocRow>

      <DocRow
        name="Task list card"
        description="A to-do card such as Needs attention. The header takes the CardHeader divider: a line-subtle rule under the description that runs edge to edge on padding none cards, with 16px above the rule and only 4px below it, so the first row's own padding brings its content 16px under the rule. TaskList rows follow: a 36px tinted icon tile (negative, warning, info or neutral by urgency), title, one-line meta and a chevron that nudges on hover. Two full-width actions follow the list 12px below the last row (not pinned to the card bottom), a primary View button with an arrow and a secondary Resolve button with Sparkles that hands the list to Ledgerly AI."
      >
        <Card as="section" padding="none" className="w-full max-w-sm">
          <CardHeader divider title="Needs attention" description="Clear these to keep your books current" className="px-5 pt-5" />
          <TaskList
            className="px-2"
            items={[
              { icon: AlertTriangle, tone: 'negative', title: '3 overdue invoices', meta: '$7,470.00 waiting to be collected', to: '/app/invoices' },
              { icon: Landmark, tone: 'warning', title: '5 bank transactions to match', meta: 'Business Checking · since Friday', to: '/app/banking' },
              { icon: Receipt, tone: 'info', title: '3 receipts missing', meta: 'Card spend over $75 this month', to: '/app/expenses' },
              { icon: FilePen, title: '1 draft invoice not sent', meta: 'Review and send when ready', to: '/app/invoices/drafts' },
            ]}
          />
          <div className="flex flex-col gap-2 px-5 pt-3 pb-5">
            <Button icon={ArrowUpRight} fullWidth>View issues</Button>
            <Button variant="secondary" icon={Sparkles} fullWidth>Resolve issues</Button>
          </div>
        </Card>
      </DocRow>

      <DocRow
        name="Icon tiles"
        description="A 28px tinted square with a 16px icon, set 8px after a figure's label. The icon takes the tone's colour: positive (green tile, green arrow) for money in, negative (red tile, red arrow) for money out. Neutral (sunken tile, fg-icon sand-700) for summary figures such as net cash flow, and brand for anything else. Decorative only, so the label always carries the meaning."
      >
        <Demo label="money in">
          <span className="flex items-center gap-2 text-caption text-fg-subtle">Money in <IconTile icon={TrendingDown} tone="positive" /></span>
        </Demo>
        <Demo label="money out">
          <span className="flex items-center gap-2 text-caption text-fg-subtle">Money out <IconTile icon={TrendingUp} tone="negative" /></span>
        </Demo>
        <Demo label="neutral">
          <IconTile icon={Wallet} />
        </Demo>
        <Demo label="brand">
          <IconTile icon={Landmark} tone="brand" />
        </Demo>
      </DocRow>

      <DocRow name="Avatars" description="Initials with a tint derived from the name, so a client keeps the same colour everywhere. Tone accent is the lime workspace tile; tone brand (forest with lime initials) is for avatars placed on a lime surface. The sm size uses the micro type step.">
        <Demo>
          <Avatar name="Northwind Studio" size="xl" />
          <Avatar name="Harbor & Pine Co." size="lg" />
          <Avatar name="Atlas Logistics" />
          <Avatar name="Mira Okafor" />
          <Avatar name="Lumen Health" shape="square" />
          <Avatar name="Copperleaf Bakery" size="sm" />
          <Avatar name="Ledgerly" shape="square" tone="accent" />
          <Avatar name="James Morales" shape="square" tone="brand" />
        </Demo>
      </DocRow>

      <Decision>
        Cards and buttons are flat: a hairline border on warm off-white separates surfaces without any shadow, so dense dashboards
        stay quiet and the numbers stay the loudest thing on screen. Elevation is reserved for things that float: menus, toasts
        and dialogs.
      </Decision>
    </DocSection>
  )
}
