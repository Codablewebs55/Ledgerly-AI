import { Calendar, Search, Sparkles } from 'lucide-react'
import { Button, Checkbox, Input, SegmentedControl, Select, Switch, Textarea } from '@/ds'
import { Decision, Demo, DocRow, DocSection } from '../docs'

const terms = [
  { value: 'due-on-receipt', label: 'Due on receipt' },
  { value: 'net-15', label: 'Net 15' },
  { value: 'net-30', label: 'Net 30' },
  { value: 'net-60', label: 'Net 60' },
]

export default function FormsSection() {
  return (
    <DocSection
      id="forms"
      title="Inputs & form controls"
      intro="One control family. Every field shares the same 40px height, border, focus treatment and message slot, so forms read calmly."
    >
      <DocRow name="Text input" description="Labels sit above the field and stay visible. Amounts are right-aligned with tabular figures and a currency prefix.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Client name" placeholder="e.g. Northwind Studio" />
          <Input label="Amount" prefix="$" align="end" placeholder="0.00" defaultValue="12,480.50" />
          <Input label="Search invoices" icon={Search} placeholder="Client, number or amount" />
          <Input label="Tax rate" suffix="%" align="end" defaultValue="8.25" hint="Applied to taxable line items" />
        </div>
      </DocRow>

      <DocRow name="Input with action" description="A 48px field with a small button inside its right edge, for single-step entry like the Ledgerly AI composer. The action stays disabled until there is something to send.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input size="lg" aria-label="Message Ledgerly AI" placeholder="Ask about your books…" action={<Button type="submit" size="sm" icon={Sparkles} aria-label="Send message" disabled />} />
          <Input size="lg" aria-label="Message Ledgerly AI" defaultValue="Which invoices are overdue?" action={<Button type="submit" size="sm" icon={Sparkles} aria-label="Send message" />} />
        </div>
      </DocRow>

      <DocRow name="Validation" description="Errors explain how to fix the problem, sit under the field, and are linked to it for screen readers.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Client email" type="email" defaultValue="billing@northwind" error="Enter a full email address, like name@company.com" required />
          <Input label="Invoice number" defaultValue="INV-1043" disabled hint="Generated automatically" />
        </div>
      </DocRow>

      <DocRow name="Select & textarea" description="Native selects keep the OS picker on mobile. Textareas grow with the content.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Payment terms" options={terms} defaultValue="net-30" />
          <Input label="Due date" icon={Calendar} defaultValue="Dec 2, 2026" />
          <Textarea label="Notes to client" optional placeholder="Thank you for your business!" fieldClassName="sm:col-span-2" />
        </div>
      </DocRow>

      <DocRow name="Choice controls" description="Checkboxes for selections submitted with a form, switches for settings that apply instantly, segmented controls for switching views.">
        <Demo label="checkbox">
          <div className="flex flex-col gap-3">
            <Checkbox label="Attach PDF to email" defaultChecked />
            <Checkbox label="Send a copy to myself" description="We'll cc accounts@ledgerly.app" />
            <Checkbox label="Allow partial payments" disabled />
          </div>
        </Demo>
        <Demo label="switch">
          <div className="flex flex-col gap-3">
            <Switch label="Automatic payment reminders" description="3 days before and after the due date" defaultChecked />
            <Switch label="Recurring invoice" />
          </div>
        </Demo>
        <Demo label="segmented">
          <SegmentedControl
            aria-label="Reporting period"
            options={[
              { value: 'month', label: 'Month' },
              { value: 'quarter', label: 'Quarter' },
              { value: 'year', label: 'Year' },
            ]}
            defaultValue="quarter"
          />
          <SegmentedControl
            size="sm"
            aria-label="View"
            options={[
              { value: 'chart', label: 'Chart' },
              { value: 'table', label: 'Table' },
            ]}
          />
        </Demo>
      </DocRow>

      <Decision>
        Focus uses a forest border plus a soft 4px halo. The border alone passes the 3:1 contrast requirement for non-text elements,
        and the halo makes the active field easy to spot in long invoice forms without shouting.
      </Decision>
    </DocSection>
  )
}
