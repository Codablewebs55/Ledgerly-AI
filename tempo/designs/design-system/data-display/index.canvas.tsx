import { Canvas, Storyboard } from "tempo-sdk/canvas";
import { defineAsset } from "tempo-sdk/assets";
import { Card, CardHeader } from "../../../../src/ds/display/Card";
import { MetricCard } from "../../../../src/ds/display/MetricCard";
import { TaskList } from "../../../../src/ds/display/TaskList";
import { MemoryRouter } from "react-router";
import { Money } from "../../../../src/ds/display/Money";
import { Sparkline } from "../../../../src/ds/display/Sparkline";
import { CashFlowChart } from "../../../../src/ds/display/CashFlowChart";
import { AlertTriangle, Landmark, Receipt, Sparkles, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Avatar } from "../../../../src/ds/display/Avatar";
import { IconTile } from "../../../../src/ds/display/IconTile";
import { Badge } from "../../../../src/ds/display/Badge";
import { StatusBadge } from "../../../../src/ds/display/StatusBadge";
import Boardcards from "./BoardCards";
import Boardbadges from "./BoardBadges";

export default function DataDisplayCanvas() {
  return (
    <Canvas name="Data display" backgroundColor="#232323">
      <Storyboard
        id="Cards"
        name={"Cards & metrics"}
        component={Boardcards}
        layout={{ x: 0, y: 0, width: 1200, height: 3420 }}
      />
      <Storyboard
        id="Badges"
        name="Status badges"
        component={Boardbadges}
        layout={{ x: 1250, y: 0, width: 1200, height: 860 }}
      />
    </Canvas>
  );
}

defineAsset(MetricCard, {
  libraries: ["Design System"],
  usageInstructions:
    "KPI tile at the top of financial views. `value` is usually <Money/>. A full-bleed line-subtle divider separates the compact label row (16px top, 12px bottom) from the figure. `delta.increaseIsGood: false` for costs so a decrease reads green. The delta pill sits on its own line 8px above its label. Snapshot cards use `stat={{ label, value, tone }}` instead of a delta: a bordered row under the figure with the label left and the count in a chip right (`info` for neutral context, `negative` for problem figures); `footnote` becomes the caption under it. For a switchable comparison window pass `period={{ options: [...] }}` (optional `value`/`onChange`): a sunken dropdown chip (“last month ⌄”: 13px regular label, chevron 4px after it, chip hugs the current label; transparent native select on top) that replaces the caption under the delta pill or stat row; drop `delta.label` and `footnote` when using it. Stat cards omit `trend` (sparklines pair with a `delta`). The header icon sits in a sunken 32px tile, coloured `text-fg-icon` (sand-700) — never a hard-coded hex. One `emphasis=\"hero\"` card (white with a 2px forest outline) per view, for the headline number.",
  variants: {
    Hero: { render: () => <MetricCard emphasis="hero" label="Cash balance" value={<Money amount={184250} />} delta={{ value: 8.2 }} period={{ options: ["last month", "last quarter", "last year"] }} trend={[42, 48, 45, 53, 51, 58, 62, 60, 67, 71, 69, 78]} /> },
    Revenue: { render: () => <MetricCard label="Revenue · Nov" value={<Money amount={48920.4} />} delta={{ value: 12.4, label: "vs Oct" }} trend={[18, 22, 21, 26, 24, 29, 31, 30, 34, 33, 37, 41]} /> },
    Expenses: { render: () => <MetricCard label="Expenses · Nov" value={<Money amount={21305.12} />} delta={{ value: -6.1, label: "vs Oct", increaseIsGood: false }} trend={[30, 29, 31, 28, 27, 26, 27, 25, 24, 25, 23, 22]} /> },
    "With info stat": { render: () => <MetricCard label="Outstanding" value={<Money amount={52850.48} />} stat={{ label: "Open invoices", value: 6, tone: "info" }} period={{ options: ["last month", "last quarter", "last year"] }} /> },
    "With negative stat": { render: () => <MetricCard label="Overdue" value={<Money amount={7470} />} stat={{ label: "Past-due invoices", value: 3, tone: "negative" }} period={{ options: ["last month", "last quarter", "last year"] }} /> },
  },
});

defineAsset(Card, {
  libraries: ["Design System"],
  usageInstructions:
    "Base surface for grouped content; pair with CardHeader. Tones: default (most content), sunken (secondary groups), inverse (one hero moment), emphasis (2px line-brand border, the one highlighted card in a set such as the hero MetricCard), inverse-raised (a card on a forest band, e.g. marketing quotes and AI steps), insight (AI assistant output only). `radius`: lg (app, default), xl (marketing cards), 2xl (marketing feature cards, product frames). Never restyle tones with `!` overrides — add a tone instead. For a padding-none card holding an embedded Table, use `<CardHeader inset …/>`. Insight cards open with `<CardHeader variant=\"band\" icon={Sparkles} …/>`: a full-bleed bg-accent-muted strip (lime-200) with a 36px forest icon tile, heading-sm title and muted caption; the rest of the card stays bg-accent-subtle. `<CardHeader divider …/>` adds a line-subtle rule under the header (16px above the rule, 4px below — the list rows that follow supply their own 12px padding, so don't add a margin override); on `padding=\"none\"` cards (header carries px-5 md:px-6) it runs edge to edge — used by the Needs attention card above its TaskList.",
  variants: {
    Default: { render: () => <Card><p className="text-body-sm">Outstanding receivables</p></Card> },
    Insight: { render: () => <Card tone="insight"><CardHeader variant="band" icon={Sparkles} title="Ledgerly AI" description="3 things worth a look today" /><p className="text-body-sm">Two clients usually pay 9 days late.</p></Card> },
  },
});

defineAsset(Money, {
  libraries: ["Design System"],
  usageInstructions: "EVERY currency amount. Tabular figures, true minus sign, red for negatives; `signed` for deltas, `compact` for chart axes only. Never format money inline.",
  variants: {
    Default: { props: { amount: 12480.5 } },
    Negative: { props: { amount: -3200 } },
    Signed: { props: { amount: 1840, signed: true } },
    Compact: { props: { amount: 184250, compact: true } },
  },
});

defineAsset(Sparkline, {
  libraries: ["Design System"],
  usageInstructions: "Word-sized trend next to the number it summarises (aria-hidden — never the only carrier of meaning). Draws in left to right on mount (animate-line-draw); static under reduced motion.",
  variants: {
    Up: { props: { values: [42, 48, 45, 53, 51, 58, 62, 60, 67, 71, 69, 78] } },
    Down: { props: { values: [30, 29, 31, 28, 27, 26, 25, 24, 22], tone: "negative" } },
  },
});

defineAsset(CashFlowChart, {
  libraries: ["Design System"],
  usageInstructions: "Money in vs money out per period (dashboard, cash flow report). Money in is forest (chart-1), money out is bg-accent lime. Put it in a Card under a headline net figure; mark the current, unfinished month `partial`. Not for single-series trends — use Sparkline. Bars grow up from the baseline on mount, staggered left to right (animate-bar-grow); static under reduced motion.",
  variants: {
    "Last 6 months": {
      props: {
        "aria-label": "Money in and out, last 6 months",
        data: [
          { label: "Jun", moneyIn: 27650, moneyOut: 18900 },
          { label: "Jul", moneyIn: 31200, moneyOut: 20400 },
          { label: "Aug", moneyIn: 28900, moneyOut: 19650 },
          { label: "Sep", moneyIn: 33450, moneyOut: 21200 },
          { label: "Oct", moneyIn: 36120, moneyOut: 22780 },
          { label: "Nov", moneyIn: 24965, moneyOut: 14310, partial: true },
        ],
      },
    },
  },
});

defineAsset(IconTile, {
  libraries: ["Design System"],
  usageInstructions: "28px tinted square with a 16px decorative icon, placed 8px after a figure's label (`flex items-center gap-2` on the label). The icon inherits the tone colour: `positive` (green tile + green fg-positive arrow, TrendingDown) beside Money in, `negative` (red tile + red fg-negative arrow, TrendingUp) beside Money out; `neutral` (sunken tile, fg-icon sand-700) with ArrowDownUp beside a net figure — never pass a style override for colour; in a row of label+figure pairs, bottom-align the cells (`items-end`); `neutral`/`brand` otherwise. Never the only carrier of meaning — the label says it. For status words use StatusBadge.",
  variants: {
    "Money in": { render: () => <IconTile icon={TrendingDown} tone="positive" /> },
    "Money out": { render: () => <IconTile icon={TrendingUp} tone="negative" /> },
    Neutral: { render: () => <IconTile icon={Wallet} /> },
  },
});

defineAsset(TaskList, {
  libraries: ["Design System"],
  usageInstructions:
    "Linked to-do rows inside a `padding=\"none\"` Card (Needs attention): pass `items` of { icon, tone, title, meta, to }. Tone tints the 36px icon tile by urgency — negative (overdue), warning (to match), info (missing), neutral (drafts). Give the list `className=\"px-2\"`, put `<CardHeader divider …/>` above it, and follow it with two full-width Buttons in a `pt-3` stack directly under the list (no `mt-auto`, so they never drift to the card bottom): primary `View issues` (ArrowUpRight) and secondary `Resolve issues` (Sparkles, hands off to Ledgerly AI).",
  variants: {
    "Needs attention": {
      render: () => (
        <MemoryRouter>
        <TaskList
          items={[
            { icon: AlertTriangle, tone: "negative", title: "3 overdue invoices", meta: "$7,470.00 waiting to be collected", to: "/app/invoices" },
            { icon: Landmark, tone: "warning", title: "5 bank transactions to match", meta: "Business Checking · since Friday", to: "/app/banking" },
            { icon: Receipt, tone: "info", title: "3 receipts missing", meta: "Card spend over $75 this month", to: "/app/expenses" },
          ]}
        />
        </MemoryRouter>
      ),
    },
  },
});

defineAsset(Avatar, {
  libraries: ["Design System"],
  usageInstructions: "Initials for clients, vendors and teammates; tint is derived from the name so it's stable everywhere. `tone=\"accent\"` is the lime workspace tile; `tone=\"brand\"` (forest, lime initials) is for avatars on a lime surface. Never recolour with className overrides.",
  variants: {
    Client: { props: { name: "Northwind Studio" } },
    Large: { props: { name: "Harbor & Pine Co.", size: "lg" } },
  },
});

defineAsset(Badge, {
  libraries: ["Design System"],
  usageInstructions: "Category and count labels. For lifecycle states (paid, overdue, matched…) use StatusBadge, never a hand-picked Badge tone. `draft` (bg-draft-subtle amber-100, text-fg-draft amber-700, amber-600 dot) is reserved for unsent work. `neutral` (the default) is the subtle-lime pill with forest text. `muted` (bg-surface-sunken, text-fg) is the quiet context pill under a summary figure, used only on the Invoices summary stats. `inverse` is only for bg-inverse surfaces (the side nav plan); `inverse-accent` is the outlined lime pill on forest (the Recommended pricing plan). Every tone is a token pair: never pass inline colour overrides, and status tones keep their documented semantic colours everywhere.",
  variants: {
    Neutral: { props: { children: "Recurring" } },
    Brand: { props: { children: "Net 30", tone: "brand" } },
    Muted: { props: { children: "Last 90 days", tone: "muted" } },
    "AI suggestion": { props: { children: "AI suggestion", tone: "accent" } },
    "Plan (on inverse)": { props: { children: "Pro Plan", tone: "inverse", size: "sm" } },
    "Recommended (on inverse)": { props: { children: "Recommended", tone: "inverse-accent" } },
  },
});

defineAsset(StatusBadge, {
  libraries: ["Design System"],
  usageInstructions: "The only way to show an invoice, expense or bank-transaction state. Label and tone come from the shared status vocabulary. Draft uses the dedicated amber `draft` tone, a step stronger than the warning tint used by Due soon.",
  variants: {
    Paid: { props: { status: "paid" } },
    Overdue: { props: { status: "overdue" } },
    Sent: { props: { status: "sent" } },
    Draft: { props: { status: "draft" } },
    "Suggested match": { props: { status: "suggested" } },
  },
});
