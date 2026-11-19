import { ArrowRight, FileText, Inbox, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { Alert, Button, Card, Dialog, DialogPanel, EmptyState, Input, Sheet, Skeleton, ToastCard, useToast } from '@/ds'
import { Decision, Demo, DocRow, DocSection } from '../docs'

export default function FeedbackSection() {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <DocSection
      id="feedback"
      title="Feedback"
      intro="Telling people what happened and what to do next. Inline alerts persist, toasts confirm and fade, dialogs ask for a decision."
    >
      <DocRow name="Alerts" description="Inline and persistent, tied to nearby content. The insight tone is reserved for the AI assistant.">
        <Alert tone="insight" title="Cash is trending 18% above forecast" action={<Button size="sm" variant="accent" icon={ArrowRight} iconPosition="end">See breakdown</Button>}>
          Three invoices were paid early this week. You could move $20,000 to your tax reserve.
        </Alert>
        <Alert tone="info" title="Bank feed synced">42 new transactions from Mercury Checking ••4021.</Alert>
        <Alert tone="positive" title="Invoice INV-1040 paid in full" onDismiss={() => undefined} />
        <Alert tone="warning" title="2 invoices are overdue">Harbor & Pine Co. and Mira Okafor owe $4,650 combined.</Alert>
        <Alert tone="negative" title="Couldn't connect to your bank">Your Chase connection expired. Reconnect to keep transactions up to date.</Alert>
      </DocRow>

      <DocRow name="Toasts" description="Quick confirmation after an action, with an optional follow-up action. Bottom-right on desktop, above the tab bar on mobile.">
        <div className="max-w-sm">
          <ToastCard title="Invoice saved as draft" description="INV-1043 · Northwind Studio · $4,200.00" action={{ label: 'View invoice', onClick: () => undefined }} />
        </div>
        <Demo>
          <Button variant="secondary" onClick={() => toast.show({ title: 'Invoice saved as draft', description: 'INV-1043 · Northwind Studio' })}>
            Show success toast
          </Button>
          <Button variant="secondary" onClick={() => toast.show({ title: 'Match accepted', description: 'Stripe payout → INV-1040', tone: 'info' })}>
            Show info toast
          </Button>
        </Demo>
      </DocRow>

      <DocRow layout="stack" name="Dialog" description="For decisions that block the flow. Focus is trapped, and Esc or the scrim closes it. On phones it becomes a bottom sheet.">
        <div className="rounded-lg bg-overlay p-4 sm:p-8">
          <DialogPanel
            size="sm"
            title="Send invoice INV-1043?"
            description="Northwind Studio will receive it at billing@northwind.studio."
            onClose={() => undefined}
            footer={
              <>
                <Button variant="secondary">Cancel</Button>
                <Button>Send invoice</Button>
              </>
            }
            className="mx-auto"
          >
            <Input label="Message" defaultValue="Hi Ana, here's November's invoice. Thank you!" />
          </DialogPanel>
        </div>
        <Demo>
          <Button onClick={() => setOpen(true)}>Open live dialog</Button>
        </Demo>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          size="sm"
          title="Discard this draft?"
          description="Line items and notes on INV-1043 will be lost. This can't be undone."
          footer={
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Keep editing
              </Button>
              <Button variant="danger" onClick={() => setOpen(false)}>
                Discard draft
              </Button>
            </>
          }
        />
      </DocRow>

      <DocRow
        name="Sheet"
        description="A modal side panel with its own scrim, focus trap, Escape and scroll lock. Right: tool panels such as Ledgerly AI — a 416px (sheet-width) panel from 768px, a near-full-height bottom sheet on phones. Left: the navigation drawer holding SideNav. The content brings its own heading and close button."
      >
        <Button variant="secondary" onClick={() => setSheetOpen(true)}>
          Open side panel
        </Button>
        <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} aria-labelledby="sheet-demo-title">
          <div className="flex items-center justify-between gap-3 border-b border-line-subtle px-5 py-4">
            <h3 id="sheet-demo-title" className="text-heading-sm">
              Side panel
            </h3>
            <Button variant="ghost" size="sm" icon={X} aria-label="Close" data-autofocus onClick={() => setSheetOpen(false)} />
          </div>
          <p className="px-5 py-4 text-body-sm text-fg-muted">Tool panels such as Ledgerly AI open here, beside the page they are looking at.</p>
        </Sheet>
      </DocRow>

      <DocRow layout="stack" name="Empty & loading" description="Empty states explain and offer the next step. Skeletons mirror the final layout so nothing jumps when data arrives.">
        <div className="grid gap-4 md:grid-cols-2">
          <Card padding="none">
            <EmptyState
              icon={Inbox}
              title="You're all caught up"
              description="Every bank transaction is reconciled. New ones will appear here after your next sync."
              actions={<Button variant="secondary" size="sm">Sync now</Button>}
            />
          </Card>
          <Card padding="none">
            <EmptyState
              icon={FileText}
              title="Send your first invoice"
              description="Create an invoice in under a minute. Ledgerly tracks it until it's paid."
              actions={<Button size="sm" icon={Plus}>New invoice</Button>}
            />
          </Card>
          <Card className="flex flex-col gap-4" aria-labelledby="sk">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="size-8 rounded-md" />
            </div>
            <Skeleton className="h-7 w-40" />
            <div className="flex items-end justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-8 w-24" />
            </div>
          </Card>
          <Card padding="none" className="divide-y divide-line-subtle">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="h-3.5 flex-1" />
                <Skeleton className="h-3.5 w-16" />
              </div>
            ))}
          </Card>
        </div>
      </DocRow>

      <Decision>
        Toasts are dark forest so they read above any surface, including the warm canvas, white cards and data-dense tables, without a
        loud colour. Their only lime is the success glyph and follow-up action, pointing at what to do next.
      </Decision>
    </DocSection>
  )
}
