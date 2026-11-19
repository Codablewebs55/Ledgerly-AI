import { Canvas, Storyboard } from "tempo-sdk/canvas";
import { defineAsset } from "tempo-sdk/assets";
import { SideNav } from "../../../../src/ds/navigation/SideNav";
import { BottomNav } from "../../../../src/ds/navigation/BottomNav";
import { Tabs } from "../../../../src/ds/navigation/Tabs";
import { PageHeader } from "../../../../src/ds/layout/PageHeader";
import { MenuItem, Popover } from "../../../../src/ds/navigation/Popover";
import { Logo } from "../../../../src/ds/brand/Logo";
import { WorkspaceCard } from "../../../../src/ds/navigation/WorkspaceCard";
import { Sheet } from "../../../../src/ds/feedback/Sheet";
import { appNav, mobileCreateAction, mobileNav } from "../../../../src/app/navigation";
import Boardnavigation from "./BoardNavigation";

export default function NavigationCanvas() {
  return (
    <Canvas name="Navigation" backgroundColor="#232323">
      <Storyboard
        id="Navigation"
        name="Navigation"
        component={Boardnavigation}
        layout={{ x: 0, y: 0, width: 1200, height: 3660 }}
      />
    </Canvas>
  );
}

defineAsset(SideNav, {
  libraries: ["Design System"],
  usageInstructions: "Primary app navigation. Full width from 1280px (pass `onToggleCollapsed` for the collapse/expand control), `collapsed` icon rail on tablets (768–1279px), and inside a left Sheet as the drawer on phones. Feed it `appNav` from src/app/navigation.ts — never hand-build nav items in a page.",
  variants: {
    "App navigation": { props: { sections: appNav } },
    "Collapsed rail": { props: { sections: appNav, collapsed: true } },
    "Collapsible (desktop)": { props: { sections: appNav, onToggleCollapsed: () => {} } },
  },
});

defineAsset(WorkspaceCard, {
  libraries: ["Design System"],
  usageInstructions: "SideNav footer (expanded sidebar and the navigation drawer): the business, its plan, an account menu (pass MenuItems as `menu`) and an optional upgrade band. Not for the collapsed rail — that footer is the expand button.",
  variants: {
    "With upgrade": { props: { name: "Dafe Studio LLC", plan: "Pro Plan", upgrade: { label: "🚀 Go unlimited" } } },
    "Plan only": { props: { name: "Dafe Studio LLC", plan: "Pro Plan" } },
  },
});

defineAsset(BottomNav, {
  libraries: ["Design System"],
  usageInstructions: "Primary navigation below 768px: `mobileNav` items + `mobileCreateAction`. Max four destinations.",
  variants: {
    "App tab bar": { props: { items: mobileNav, action: mobileCreateAction, fixed: false } },
  },
});

defineAsset(Tabs, {
  libraries: ["Design System"],
  usageInstructions: "Filter or switch sections within one page (invoice status filters). Include `count` when it helps people choose.",
  variants: {
    "Invoice status": {
      props: {
        "aria-label": "Invoice status",
        items: [
          { id: "all", label: "All", count: 42 },
          { id: "draft", label: "Draft", count: 3 },
          { id: "overdue", label: "Overdue", count: 2 },
          { id: "paid", label: "Paid", count: 28 },
        ],
      },
    },
  },
});

defineAsset(PageHeader, {
  libraries: ["Design System"],
  usageInstructions: "Top of every app page: title, optional `back` link, `meta` (status badge) and page `actions`.",
  variants: {
    "List page": { props: { title: "Invoices", description: "Create, send and track every invoice in one place." } },
    "Detail page": { props: { title: "INV-1042", back: { label: "Invoices", to: "/app/invoices" }, description: "Northwind Studio · Due Dec 2, 2026" } },
  },
});

defineAsset(MenuItem, {
  libraries: ["Design System"],
  usageInstructions: "Rows inside a Popover (account menu, notifications, row actions). Use `to` for navigation, `onSelect` for actions, `tone=\"danger\"` for destructive items such as Sign out. Popover menus inside tables or other overflow-hidden containers take `strategy=\"fixed\"` (RowActions does this for you).",
  variants: {
    "Link item": { props: { children: "Profile and settings", to: "/app/settings" } },
    "With description": { props: { children: "Billing and plan", description: "Dafe Studio LLC · Pro Plan" } },
    "Danger": { props: { children: "Sign out", tone: "danger" } },
  },
});

defineAsset(Sheet, {
  libraries: ["Design System"],
  usageInstructions: "Modal side panel. `side=\"left\"` holds SideNav as the phone/tablet navigation drawer; `side=\"right\"` is a tool panel (Ledgerly AI) that becomes a bottom sheet below 768px. Content supplies its own header and close button; mark the first field with data-autofocus.",
  variants: {
    "Closed": { props: { open: false, onClose: () => {}, children: null } },
  },
});

defineAsset(Popover, {
  libraries: ["Design System"],
  usageInstructions: "Anchored panel for menus (account, notifications, row actions, sort and filter menus). Pass a `trigger` render function that spreads the provided props onto a real button; fill it with MenuItem / MenuSeparator. `strategy=\"fixed\"` inside scrolling tables and the top bar. Closes on outside click, Escape (focus returns to the trigger) and after a choice; arrow keys move between items. Surface is bg-surface-raised + shadow-lg; never build an ad-hoc dropdown in a page.",
});

defineAsset(Logo, {
  libraries: ["Design System"],
  usageInstructions: "The Ledgerly wordmark. `tone=\"default\"` on light surfaces (forest mark, lime tick), `tone=\"inverse\"` on forest/inverse surfaces such as the marketing header and side nav. `markOnly` for the collapsed rail. Wrap in a Link to / with aria-label \"Ledgerly home\"; never recolour it.",
  variants: {
    Default: { props: { tone: "default" } },
    Inverse: { props: { tone: "inverse" } },
    "Mark only": { props: { markOnly: true } },
  },
});
