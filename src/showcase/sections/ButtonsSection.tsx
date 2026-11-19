import { ArrowRight, Copy, Download, MoreHorizontal, Plus, Send, Trash2 } from 'lucide-react'
import { Button } from '@/ds'
import { Decision, Demo, DocRow, DocSection } from '../docs'

export default function ButtonsSection() {
  return (
    <DocSection
      id="buttons"
      title="Buttons"
      intro="Actions people take. Six variants form a weight ladder, so the most important action on a screen is always obvious."
    >
      <DocRow layout="stack" name="Variants" description="One primary per view. Accent is reserved for the single key call-to-action, such as a marketing CTA or accepting an AI suggestion. Secondary is outlined in line-control (sand-200, #e8e3d7), the shared border for every outline button, including row actions and the profile menu trigger.">
        <Demo label="primary">
          <Button icon={Plus}>New invoice</Button>
          <Button icon={Send}>Send invoice</Button>
        </Demo>
        <Demo label="accent">
          <Button variant="accent" icon={ArrowRight} iconPosition="end">
            Start free trial
          </Button>
        </Demo>
        <Demo label="secondary">
          <Button variant="secondary" icon={Download}>
            Export CSV
          </Button>
          <Button variant="secondary">Save as draft</Button>
        </Demo>
        <Demo label="ghost">
          <Button variant="ghost">Cancel</Button>
          <Button variant="ghost" icon={MoreHorizontal} aria-label="More actions" />
        </Demo>
        <Demo label="danger">
          <Button variant="danger" icon={Trash2}>
            Void invoice
          </Button>
        </Demo>
      </DocRow>

      <DocRow
        name="Row icon actions"
        description="Ghost icon-only buttons (40px, 16px icon in fg-muted) pulled together with -ml-2 on the second, so the icons read as a pair 16px apart, at the end of an editable row, such as an invoice line item. Duplicate (Copy) comes first and stays disabled until the row has an entry in any field. Remove (Trash2) follows and is disabled while it is the only row. Both keep the neutral ghost colour and always carry an aria-label naming the row."
      >
        <Demo label="empty row">
          <span className="flex items-center">
            <Button variant="ghost" icon={Copy} aria-label="Duplicate line 1" disabled />
            <Button variant="ghost" icon={Trash2} aria-label="Remove line 1" disabled className="-ml-2" />
          </span>
        </Demo>
        <Demo label="row with entry">
          <span className="flex items-center">
            <Button variant="ghost" icon={Copy} aria-label="Duplicate line 1" />
            <Button variant="ghost" icon={Trash2} aria-label="Remove line 1" className="-ml-2" />
          </span>
        </Demo>
      </DocRow>

      <DocRow name="On dark surfaces" description="Inside forest bands (marketing hero, inverse cards), pair an accent action with the inverse outline.">
        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-inverse p-5">
          <Button variant="accent" size="lg">
            Start free trial
          </Button>
          <Button variant="inverse" size="lg">
            Book a demo
          </Button>
        </div>
      </DocRow>

      <DocRow name="Sizes" description="md (40px) is the app default. sm (32px) suits dense table toolbars, lg (48px) marketing and mobile primary actions.">
        <Demo label="sm · 32px">
          <Button size="sm" icon={Plus}>
            Add line
          </Button>
          <Button size="sm" variant="secondary">
            Filter
          </Button>
        </Demo>
        <Demo label="md · 40px">
          <Button icon={Plus}>New invoice</Button>
          <Button variant="secondary">Filter</Button>
        </Demo>
        <Demo label="lg · 48px">
          <Button size="lg">Create account</Button>
          <Button size="lg" variant="secondary">
            Talk to sales
          </Button>
        </Demo>
      </DocRow>

      <DocRow name="States" description="Disabled and loading are built in. A loading button keeps its width and label, so the layout doesn't jump.">
        <Demo label="disabled">
          <Button disabled>Send invoice</Button>
          <Button variant="secondary" disabled>
            Export
          </Button>
        </Demo>
        <Demo label="loading">
          <Button loading>Saving</Button>
          <Button variant="secondary" loading>
            Exporting
          </Button>
        </Demo>
        <Demo label="full width">
          <div className="w-full max-w-xs">
            <Button fullWidth size="lg">
              Continue
            </Button>
          </div>
        </Demo>
      </DocRow>

      <Decision>
        Buttons use semibold weight and an 8px radius. That's crisp enough to feel precise for a finance tool and soft enough to stay
        approachable. Lime appears on a button only when the action is the single most valuable next step.
      </Decision>
    </DocSection>
  )
}
