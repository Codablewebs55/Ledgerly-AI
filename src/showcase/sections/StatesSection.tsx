import { Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button, Checkbox, Input, Switch } from '@/ds'
import { DocRow, DocSection } from '../docs'

// Hover / focus / pressed are interaction states, so they're forced here with
// the same token classes the components apply on interaction. That keeps the
// matrix reviewable in screenshots and on the canvas.
const forcedFocus = 'outline-2! outline-offset-2! outline-solid! outline-line-focus!'

function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-1">
      <span className="text-caption text-fg-subtle">{label}</span>
      {children}
    </div>
  )
}

export default function StatesSection() {
  return (
    <DocSection
      id="states"
      title="Component states"
      intro="Every interactive component has a designed answer for each state. Hover, focus and pressed are forced below so they can be reviewed side by side."
    >
      <DocRow layout="stack" name="Primary button" description="Hover darkens one step and pressed two. Focus adds a 2px forest ring offset from the edge. Disabled drops to a neutral fill, never just reduced opacity.">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-6">
          <Cell label="Default"><Button icon={Plus}>New invoice</Button></Cell>
          <Cell label="Hover"><Button icon={Plus} className="bg-brand-hover!">New invoice</Button></Cell>
          <Cell label="Pressed"><Button icon={Plus} className="scale-[0.98] bg-brand-active!">New invoice</Button></Cell>
          <Cell label="Focus"><Button icon={Plus} className={forcedFocus}>New invoice</Button></Cell>
          <Cell label="Loading"><Button loading>Saving</Button></Cell>
          <Cell label="Disabled"><Button icon={Plus} disabled>New invoice</Button></Cell>
        </div>
      </DocRow>

      <DocRow layout="stack" name="Secondary button" description="The border strengthens on hover. The fill tints only slightly, so secondary never competes with primary.">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-6">
          <Cell label="Default"><Button variant="secondary">Export</Button></Cell>
          <Cell label="Hover"><Button variant="secondary" className="border-line-input! bg-surface-hover!">Export</Button></Cell>
          <Cell label="Pressed"><Button variant="secondary" className="scale-[0.98] border-line-input! bg-surface-hover!">Export</Button></Cell>
          <Cell label="Focus"><Button variant="secondary" className={forcedFocus}>Export</Button></Cell>
          <Cell label="Loading"><Button variant="secondary" loading>Exporting</Button></Cell>
          <Cell label="Disabled"><Button variant="secondary" disabled>Export</Button></Cell>
        </div>
      </DocRow>

      <DocRow layout="stack" name="Text input" description="Hover deepens the border. Focus switches it to forest with a soft halo. Errors use red border and text plus an icon, never colour alone.">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <Input label="Default" placeholder="Client name" />
          <Input label="Hover" placeholder="Client name" className="border-line-field-hover!" />
          <Input label="Focus" defaultValue="Northwind" className="border-line-brand! ring-4 ring-brand-subtle" />
          <Input label="Filled" defaultValue="Northwind Studio" />
          <Input label="Error" defaultValue="northwind@" error="Enter a full email address" />
          <Input label="Disabled" defaultValue="INV-1043" disabled />
        </div>
      </DocRow>

      <DocRow layout="stack" name="Choice controls" description="Checked states use the brand fill. Disabled controls keep their shape and drop to neutral.">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          <Cell label="Unchecked"><Checkbox label="Attach PDF" /></Cell>
          <Cell label="Checked"><Checkbox label="Attach PDF" defaultChecked /></Cell>
          <Cell label="Disabled"><Checkbox label="Attach PDF" disabled /></Cell>
          <Cell label="Disabled checked"><Checkbox label="Attach PDF" disabled defaultChecked /></Cell>
          <Cell label="Off"><Switch label="Reminders" /></Cell>
          <Cell label="On"><Switch label="Reminders" defaultChecked /></Cell>
          <Cell label="Disabled"><Switch label="Reminders" disabled /></Cell>
          <Cell label="Disabled on"><Switch label="Reminders" disabled defaultChecked /></Cell>
        </div>
      </DocRow>
    </DocSection>
  )
}
