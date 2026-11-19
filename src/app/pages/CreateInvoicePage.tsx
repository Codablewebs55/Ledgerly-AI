import { CloudCheck, Copy, Eye, Plus, Send, Sparkles, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Alert, Avatar, Button, Card, CardHeader, Dialog, Input, Money, PageHeader, Select, StatusBadge, Textarea, useToast } from '@/ds'
import { addDays, clientById, formatDate, lineTotal, nextInvoiceNumber, saveInvoice, totals, useInvoices } from '../data/invoices'
import { clients, TODAY } from '../data/seed'
import type { Invoice, LineItem, StoredInvoiceStatus } from '../data/types'
import { useAssistant } from '../shell/assistant-context'

const termOptions = [
  { value: '0', label: 'Due on receipt' },
  { value: '15', label: 'Net 15' },
  { value: '30', label: 'Net 30' },
  { value: '45', label: 'Net 45' },
  { value: '60', label: 'Net 60' },
]

const taxOptions = [
  { value: '0', label: 'No tax' },
  { value: '5', label: 'Tax 5%' },
  { value: '8.875', label: 'NY tax 8.875%' },
  { value: '10', label: 'Tax 10%' },
  { value: '20', label: 'VAT 20%' },
]

let lineSeq = 0
/** A line counts as started once any field moves off its blank default (qty 1). */
const hasEntry = (li: LineItem) => li.description.trim() !== '' || li.rate > 0 || li.quantity !== 1

const blankLine = (): LineItem => ({ id: `li-${Date.now().toString(36)}-${++lineSeq}`, description: '', quantity: 1, rate: 0 })

type Errors = { client?: string; items?: Record<string, { description?: string; rate?: string }> }

// Drafts save themselves: every edit is written to the invoice store shortly after
// the person stops typing, once a client is chosen (a draft needs someone to bill).
const AUTOSAVE_DELAY = 600
const savedTime = (t: number) => new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

export default function CreateInvoicePage() {
  const invoices = useInvoices()
  const navigate = useNavigate()
  const assistant = useAssistant()
  const { show } = useToast()

  const [clientId, setClientId] = useState('')
  const [number, setNumber] = useState(() => nextInvoiceNumber(invoices))
  const [issueDate, setIssueDate] = useState(TODAY)
  const [terms, setTerms] = useState('30')
  const [items, setItems] = useState<LineItem[]>(() => [blankLine()])
  const [taxRate, setTaxRate] = useState('0')
  const [notes, setNotes] = useState('Thank you for your business. Payment by bank transfer or card via the invoice link.')
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  // One stable record per invoice: the first autosave creates it, later ones update it.
  const [draftId] = useState(() => `inv-draft-${Date.now().toString(36)}`)
  const [createdAt] = useState(() => Date.now())
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const sent = useRef(false)

  const client = clientById(clientId)
  const dueDate = addDays(issueDate || TODAY, Number(terms))
  const sums = useMemo(() => totals({ items, taxRate: Number(taxRate), amountPaid: 0 }), [items, taxRate])

  const validate = (): Errors => {
    const next: Errors = {}
    if (!clientId) next.client = 'Choose who this invoice is for.'
    const itemErrors: NonNullable<Errors['items']> = {}
    items.forEach((li) => {
      const e: { description?: string; rate?: string } = {}
      if (!li.description.trim()) e.description = 'Describe the work or product.'
      if (!(li.rate > 0) || !(li.quantity > 0)) e.rate = 'Add a quantity and rate above zero.'
      if (e.description || e.rate) itemErrors[li.id] = e
    })
    if (Object.keys(itemErrors).length) next.items = itemErrors
    return next
  }

  // Re-validate as the person fixes things, but only after the first attempt.
  const liveErrors = submitted ? validate() : errors

  const record = (status: StoredInvoiceStatus): Invoice => ({
    id: draftId,
    number,
    clientId,
    issueDate,
    dueDate,
    status,
    items: items.map((li) => ({ ...li, description: li.description.trim() })),
    taxRate: Number(taxRate),
    amountPaid: 0,
    notes: notes.trim() || undefined,
    createdAt,
  })

  // Autosave as a draft after each pause in editing.
  useEffect(() => {
    if (!clientId || sent.current) return
    const timer = setTimeout(() => {
      if (sent.current) return
      saveInvoice(record('draft'))
      setSavedAt(Date.now())
    }, AUTOSAVE_DELAY)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- record() reads exactly these fields
  }, [clientId, number, issueDate, dueDate, items, taxRate, notes])

  const update = (id: string, patch: Partial<LineItem>) => setItems((list) => list.map((li) => (li.id === id ? { ...li, ...patch } : li)))

  const send = (e?: FormEvent) => {
    e?.preventDefault()
    setSubmitted(true)
    const found = validate()
    setErrors(found)
    if (found.client || found.items) {
      show({ tone: 'error', title: 'A few details are missing', description: 'Check the highlighted fields and try again.' })
      return
    }
    sent.current = true
    setPreviewOpen(false)
    const created = saveInvoice(record('sent'))
    navigate(`/app/invoices?created=${created.id}`)
  }

  const errorCount = (liveErrors.client ? 1 : 0) + Object.keys(liveErrors.items ?? {}).length

  return (
    <form onSubmit={send} noValidate className="flex flex-col gap-(--ldg-section-gap)">
      <PageHeader
        back={{ label: 'Invoices', to: '/app/invoices' }}
        title={`New invoice ${number}`}
        meta={<StatusBadge status="draft" />}
        description="Add line items and watch the total update as you go."
      />

      {submitted && errorCount > 0 && (
        <Alert tone="negative" title={`Fix ${errorCount} ${errorCount === 1 ? 'thing' : 'things'} before sending`}>
          Required details are highlighted below.
        </Alert>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card as="section" aria-labelledby="details-title">
            <CardHeader id="details-title" title="Details" description="Who you're billing and when it's due" />
            <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
              <Select
                label="Client"
                required
                placeholder="Choose a client"
                value={clientId}
                error={liveErrors.client}
                options={clients.map((c) => ({ value: c.id, label: c.name }))}
                onChange={(e) => {
                  setClientId(e.target.value)
                  const c = clientById(e.target.value)
                  if (c) setTerms(String(c.terms))
                }}
                hint={client?.email}
              />
              <Input label="Invoice number" value={number} onChange={(e) => setNumber(e.target.value)} hint="Numbers continue from your last invoice" />
              <Input label="Issue date" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
              <Select label="Payment terms" value={terms} options={termOptions} onChange={(e) => setTerms(e.target.value)} hint={`Due ${formatDate(dueDate)}`} />
            </div>
          </Card>

          <Card as="section" aria-labelledby="items-title">
            <CardHeader id="items-title" title="Line items" description="What you're charging for" />

            {/* Column labels — desktop only; each field keeps its own accessible name. */}
            <div className="mb-2 hidden grid-cols-[minmax(0,1fr)_5.5rem_8rem_7rem_4.5rem] gap-3 text-caption font-medium text-fg-muted md:grid" aria-hidden>
              <span>Description</span>
              <span>Qty</span>
              <span>Rate</span>
              <span className="text-right">Amount</span>
              <span />
            </div>

            <ul className="flex flex-col gap-3">
              {items.map((li, i) => {
                const e = liveErrors.items?.[li.id]
                return (
                  <li
                    key={li.id}
                    className="grid grid-cols-[1fr_1fr_auto] gap-3 rounded-md border border-line-subtle p-3 md:grid-cols-[minmax(0,1fr)_5.5rem_8rem_7rem_4.5rem] md:items-start md:border-0 md:p-0"
                  >
                    <Input
                      aria-label={`Line ${i + 1} description`}
                      placeholder="e.g. Brand strategy workshop"
                      value={li.description}
                      error={e?.description}
                      onChange={(ev) => update(li.id, { description: ev.target.value })}
                      fieldClassName="col-span-3 md:col-span-1"
                      className="max-w-none"
                    />
                    <Input
                      aria-label={`Line ${i + 1} quantity`}
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="any"
                      align="end"
                      prefix={<span className="md:hidden">Qty</span>}
                      value={Number.isNaN(li.quantity) ? '' : li.quantity}
                      onChange={(ev) => update(li.id, { quantity: ev.target.valueAsNumber })}
                      className="max-w-none"
                    />
                    <Input
                      aria-label={`Line ${i + 1} rate`}
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.01"
                      prefix="$"
                      align="end"
                      placeholder="0.00"
                      value={li.rate ? li.rate : ''}
                      error={e?.rate && !e.description ? e.rate : undefined}
                      onChange={(ev) => update(li.id, { rate: ev.target.valueAsNumber || 0 })}
                      className="max-w-none"
                    />
                    <p className="col-span-2 flex h-10 items-center text-body-sm font-medium md:col-span-1 md:justify-end">
                      <span className="mr-2 text-caption font-regular text-fg-subtle md:hidden">Amount</span>
                      <Money amount={lineTotal(li)} />
                    </p>
                    {/* Row actions: duplicate (enabled once the line has any entry), then remove. */}
                    <span data-tempo-locked="true" className="flex h-10 items-center md:justify-end">
                      <Button
                        variant="ghost"
                        icon={Copy}
                        aria-label={`Duplicate line ${i + 1}`}
                        disabled={!hasEntry(li)}
                        onClick={() => setItems((list) => list.flatMap((x) => (x.id === li.id ? [x, { ...blankLine(), description: x.description, quantity: x.quantity, rate: x.rate }] : [x])))}
                      />
                      <Button
                        variant="ghost"
                        icon={Trash2}
                        className="-ml-2"
                        aria-label={`Remove line ${i + 1}`}
                        disabled={items.length === 1}
                        onClick={() => setItems((list) => list.filter((x) => x.id !== li.id))}
                      />
                    </span>
                  </li>
                )
              })}
            </ul>

            <Button variant="secondary" icon={Plus} className="mt-4" onClick={() => setItems((list) => [...list, blankLine()])}>
              Add line item
            </Button>
          </Card>

          <Card as="section" aria-labelledby="notes-title">
            <CardHeader id="notes-title" title="Notes to client" description="Shown at the bottom of the invoice" />
            <Textarea aria-label="Notes to client" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </Card>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-[calc(var(--ldg-topbar-height)+1.5rem)]" aria-label="Invoice summary">
          <Card>
            <CardHeader title="Summary" />
            {client ? (
              <div className="mb-5 flex items-center gap-3 rounded-lg border border-line-control bg-surface py-3 pr-2 pl-3">
                <Avatar name={client.name} size="lg" shape="square" tone="accent" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body-sm font-medium">{client.name}</p>
                  <p className="truncate text-caption text-fg-muted">{client.email}</p>
                </div>
                {/* Clears the client so the person can pick someone else */}
                <Button variant="ghost" icon={Trash2} aria-label={`Remove ${client.name}`} className="shrink-0 text-fg-negative hover:text-fg-negative" onClick={() => setClientId('')} />
              </div>
            ) : (
              <p className="mb-5 rounded-md border border-dashed border-line p-3 text-caption text-fg-subtle">Choose a client to see who this goes to.</p>
            )}

            <dl className="flex flex-col gap-3 text-body-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-fg-muted">Subtotal</dt>
                <dd>
                  <Money amount={sums.subtotal} />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>
                  <Select aria-label="Tax rate" size="md" value={taxRate} options={taxOptions} onChange={(e) => setTaxRate(e.target.value)} className="w-40" />
                </dt>
                <dd>
                  <Money amount={sums.tax} tone="muted" />
                </dd>
              </div>
              <div className="mt-1 flex items-end justify-between gap-4 border-t border-line pt-4">
                <dt className="font-medium">Total due</dt>
                <dd className="text-figure-lg">
                  <Money amount={sums.total} tone="inherit" />
                </dd>
              </div>
              <div className="flex justify-between gap-4 text-caption text-fg-subtle">
                <dt>Due date</dt>
                <dd>{formatDate(dueDate)}</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-col gap-2">
              <Button type="submit" icon={Send} fullWidth>
                Send invoice
              </Button>
              <Button variant="secondary" icon={Eye} fullWidth onClick={() => setPreviewOpen(true)}>
                Preview invoice
              </Button>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-caption text-fg-subtle" role="status" aria-live="polite">
              {savedAt ? (
                <>
                  <CloudCheck className="size-3.5 text-fg-icon" aria-hidden />
                  Draft saved at {savedTime(savedAt)}
                </>
              ) : clientId ? (
                'Saving draft…'
              ) : (
                'Changes save as a draft once you choose a client'
              )}
            </p>
          </Card>

          {client && client.avgDaysLate >= 3 && (
            <Alert tone="insight" title={`${client.name} usually pays ${client.avgDaysLate} days late`}>
              <p>Shorter terms or a deposit up front could bring payment closer to {formatDate(dueDate, { year: false })}.</p>
              <Button variant="secondary" size="sm" icon={Sparkles} className="mt-3" onClick={() => assistant.ask(`How can I get ${client.name} to pay on time?`)}>
                Ask Ledgerly AI
              </Button>
            </Alert>
          )}
        </aside>
      </div>

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        size="lg"
        title={`Preview ${number}`}
        description={client ? `This is what ${client.name} will see.` : 'Choose a client before you send.'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPreviewOpen(false)}>
              Keep editing
            </Button>
            <Button icon={Send} onClick={() => send()}>
              Send invoice
            </Button>
          </>
        }
      >
        <InvoicePreview number={number} clientId={clientId} issueDate={issueDate} dueDate={dueDate} items={items} taxRate={Number(taxRate)} notes={notes} />
      </Dialog>
    </form>
  )
}

type PreviewProps = Pick<Invoice, 'number' | 'clientId' | 'issueDate' | 'dueDate' | 'items' | 'taxRate'> & { notes: string }

/** The invoice document as the client receives it, rendered from the current form state. */
function InvoicePreview({ number, clientId, issueDate, dueDate, items, taxRate, notes }: PreviewProps) {
  const client = clientById(clientId)
  const sums = totals({ items, taxRate, amountPaid: 0 })
  return (
    <div className="max-h-[60vh] overflow-y-auto rounded-md border border-line bg-surface p-5 text-body-sm md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-heading-md">Dafe Studio LLC</p>
          <p className="text-caption text-fg-subtle">From Precious Dafe</p>
        </div>
        <div className="text-right">
          <p className="text-heading-md">Invoice</p>
          <p className="text-caption text-fg-subtle">{number}</p>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-caption text-fg-subtle">Bill to</dt>
          <dd className="mt-1 font-medium">{client?.name ?? <span className="text-fg-subtle">No client chosen</span>}</dd>
          {client && <dd className="text-caption text-fg-muted">{client.email}</dd>}
        </div>
        <div>
          <dt className="text-caption text-fg-subtle">Issued</dt>
          <dd className="mt-1">{formatDate(issueDate || TODAY)}</dd>
        </div>
        <div>
          <dt className="text-caption text-fg-subtle">Due</dt>
          <dd className="mt-1">{formatDate(dueDate)}</dd>
        </div>
      </dl>

      <table className="mt-6 w-full">
        <caption className="sr-only">Line items</caption>
        <thead>
          <tr className="border-b border-line text-left text-caption text-fg-subtle">
            <th scope="col" className="pb-2 font-medium">Description</th>
            <th scope="col" className="pb-2 text-right font-medium">Qty</th>
            <th scope="col" className="pb-2 text-right font-medium">Rate</th>
            <th scope="col" className="pb-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((li) => (
            <tr key={li.id} className="border-b border-line-subtle">
              <td className="py-2.5 pr-3">{li.description.trim() || <span className="text-fg-subtle">Untitled item</span>}</td>
              <td className="py-2.5 text-right figure">{Number.isNaN(li.quantity) ? 0 : li.quantity}</td>
              <td className="py-2.5 text-right"><Money amount={li.rate || 0} tone="inherit" /></td>
              <td className="py-2.5 text-right"><Money amount={lineTotal(li)} tone="inherit" /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="mt-4 ml-auto flex max-w-64 flex-col gap-2">
        <div className="flex justify-between gap-4">
          <dt className="text-fg-muted">Subtotal</dt>
          <dd><Money amount={sums.subtotal} tone="inherit" /></dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-fg-muted">Tax{taxRate ? ` (${taxRate}%)` : ''}</dt>
          <dd><Money amount={sums.tax} tone="inherit" /></dd>
        </div>
        <div className="flex items-end justify-between gap-4 border-t border-line pt-3">
          <dt className="font-medium">Total due</dt>
          <dd className="text-figure-lg"><Money amount={sums.total} tone="inherit" /></dd>
        </div>
      </dl>

      {notes.trim() && <p className="mt-6 border-t border-line-subtle pt-4 text-fg-muted">{notes.trim()}</p>}
    </div>
  )
}
