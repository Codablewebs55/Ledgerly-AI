import { BookOpen, ChevronDown, Download, LogOut, PanelLeftOpen, Send, Settings } from 'lucide-react'
import { BottomNav, Button, Logo, LogoMark, MenuItem, MenuSeparator, PageHeader, Popover, SideNav, StatusBadge, Tabs, WorkspaceCard } from '@/ds'
import { useState } from 'react'
import { appNav, mobileCreateAction, mobileNav } from '@/app/navigation'
import { AccountMenuItems } from '@/app/shell/HeaderMenus'
import { currentUser } from '@/app/shell/session'
import { Decision, DocRow, DocSection, Frame } from '../docs'

/** Workspace card exactly as the app shell renders it: same plan, menu and upgrade band. */
function DemoWorkspaceCard() {
  return <WorkspaceCard name={currentUser.org} plan={currentUser.plan} upgrade={{ label: '🚀 Go unlimited' }} menu={<AccountMenuItems />} />
}

/** Live specimen: the collapse control toggles between full sidebar and rail. */
function CollapsibleSideNav() {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <SideNav
      sections={appNav}
      collapsed={collapsed}
      onToggleCollapsed={() => setCollapsed((c) => !c)}
      header={collapsed ? <LogoMark tone="inverse" className="size-9" /> : <Logo tone="inverse" />}
      footer={<DemoWorkspaceCard />}
    />
  )
}

export default function NavigationSection() {
  return (
    <DocSection
      id="navigation"
      title="Navigation"
      intro="How people move through Ledgerly. A forest side rail on desktop, a thumb-zone tab bar on phones, and tabs and page headers within a page."
    >
      <DocRow name="Side navigation" description="Full width from 1280px, and inside the navigation drawer on phones and tablets. The lime marker shows where you are, the one place lime appears in app chrome. Counts flag work waiting. On desktop, the icon beside the logo collapses it to the icon rail; the footer icon expands it again, and the choice is remembered.">
        <Frame className="h-[48rem] w-fit" label="SideNav · 248px · collapsible · try the toggle">
          <CollapsibleSideNav />
        </Frame>
      </DocRow>

      <DocRow name="Workspace card" description="The SideNav footer on the full sidebar and in the navigation drawer. Shows whose books these are and the plan; the ••• button opens the account menu, and the band below prompts an upgrade. The business initials sit on a lime tile.">
        <Frame className="w-fit bg-inverse p-3" label="WorkspaceCard · on the forest rail">
          <div className="w-56">
            <DemoWorkspaceCard />
          </div>
        </Frame>
      </DocRow>

      <DocRow name="Collapsed rail" description="The same 72px icon rail is the collapsed desktop sidebar and the tablet (768–1279px) navigation. Labels appear as tooltips on hover and focus, counts become dots. The footer icon expands it: back to full width on desktop, into the drawer on tablet.">
        <Frame className="h-[42rem] w-fit" label="SideNav collapsed · 72px">
          <SideNav
            sections={appNav}
            collapsed
            header={<LogoMark tone="inverse" className="size-9" />}
            footer={<Button variant="inverse" icon={PanelLeftOpen} aria-label="Expand navigation" />}
          />
        </Frame>
      </DocRow>

      <DocRow name="Menus" description="Popover anchors small panels to a trigger: the account menu, notifications, row actions. Closes on outside click, Escape or a choice. Arrow keys move through items.">
        <div className="flex min-h-72 justify-end">
          <Popover
            aria-label="Account"
            defaultOpen
            trigger={(props) => (
              <Button variant="secondary" icon={ChevronDown} iconPosition="end" {...props}>
                Open menu
              </Button>
            )}
          >
            <MenuItem icon={Settings} to="/design-system/components">
              Profile and settings
            </MenuItem>
            <MenuItem icon={BookOpen} description="Tokens and components">
              Design system
            </MenuItem>
            <MenuSeparator />
            <MenuItem icon={LogOut} tone="danger">
              Sign out
            </MenuItem>
          </Popover>
        </div>
      </DocRow>

      <DocRow name="Bottom navigation" description="Below 768px. Four destinations plus a raised create action, all within thumb reach. Labels are always visible.">
        <Frame className="w-full max-w-sm" label="BottomNav · mobile">
          <div className="h-24 bg-canvas" />
          <BottomNav items={mobileNav} action={mobileCreateAction} fixed={false} />
        </Frame>
      </DocRow>

      <DocRow name="Tabs" description="Filter or switch sections within a page. Counts help people decide where to go before they click. Arrow keys move between tabs.">
        <Tabs
          aria-label="Invoice status"
          defaultValue="all"
          items={[
            { id: 'all', label: 'All', count: 42 },
            { id: 'draft', label: 'Draft', count: 3 },
            { id: 'outstanding', label: 'Outstanding', count: 9 },
            { id: 'overdue', label: 'Overdue', count: 2 },
            { id: 'paid', label: 'Paid', count: 28 },
          ]}
        />
      </DocRow>

      <DocRow name="Page header" description="Title, context and the page's actions. On mobile, actions wrap below the title instead of shrinking.">
        <PageHeader title="Invoices" description="Create, send and track every invoice in one place." actions={<Button icon={Download} variant="secondary">Export</Button>} />
        <div className="border-t border-line-subtle pt-5">
          <PageHeader
            back={{ label: 'Invoices', to: '/design-system/components' }}
            title="INV-1042"
            meta={<StatusBadge status="sent" />}
            description="Northwind Studio · Issued Nov 2, 2026 · Due Dec 2, 2026"
            actions={
              <>
                <Button variant="secondary">Download PDF</Button>
                <Button icon={Send}>Send reminder</Button>
              </>
            }
          />
        </div>
      </DocRow>

      <Decision>
        The navigation rail uses the deepest brand colour. It anchors the brand on every screen while keeping the content area
        neutral, so status colours in tables and charts never compete with the chrome around them.
      </Decision>
    </DocSection>
  )
}
