import { Sparkles } from 'lucide-react'
import { Badge, StatusBadge, type BadgeTone, type Status } from '@/ds'
import { Decision, Demo, DocRow, DocSection } from '../docs'

const tones: BadgeTone[] = ['neutral', 'brand', 'accent', 'positive', 'negative', 'warning', 'draft', 'info']

const groups: { label: string; statuses: Status[] }[] = [
  { label: 'Invoices', statuses: ['draft', 'scheduled', 'sent', 'viewed', 'partial', 'due-soon', 'paid', 'overdue', 'void'] },
  { label: 'Expenses', statuses: ['pending', 'approved', 'rejected'] },
  { label: 'Banking', statuses: ['suggested', 'matched', 'unmatched', 'excluded'] },
]

export default function BadgesSection() {
  return (
    <DocSection
      id="badges"
      title="Status badges"
      intro="Every lifecycle state is defined once, with a fixed label and tone, so 'Overdue' looks the same on the dashboard, in lists and on detail pages."
    >
      <DocRow name="Status vocabulary" description="Use Status badge with a status key. Never pick a colour by hand. A dot plus text means colour is never the only signal.">
        {groups.map((g) => (
          <Demo key={g.label} label={g.label}>
            {g.statuses.map((s) => (
              <StatusBadge key={s} status={s} />
            ))}
          </Demo>
        ))}
      </DocRow>

      <DocRow name="Tones & sizes" description="Plain badges label categories and counts. sm (20px) goes in tables, md (24px) in headers and cards. Neutral, the default, is the subtle-lime pill with forest text. The inverse tone is for the forest rail, e.g. the plan in the workspace card; inverse-accent is the outlined lime pill on forest, e.g. the Recommended pricing plan.">
        <Demo label="md">
          {tones.map((t) => (
            <Badge key={t} tone={t}>
              {t[0].toUpperCase() + t.slice(1)}
            </Badge>
          ))}
        </Demo>
        <Demo label="sm">
          {tones.map((t) => (
            <Badge key={t} tone={t} size="sm">
              {t[0].toUpperCase() + t.slice(1)}
            </Badge>
          ))}
        </Demo>
        <Demo label="with icon">
          <Badge tone="accent" icon={Sparkles}>
            AI suggestion
          </Badge>
          <Badge tone="brand">Net 30</Badge>
          <Badge>Recurring</Badge>
        </Demo>
        <Demo label="on inverse">
          <div className="flex gap-2 rounded-md bg-inverse p-3">
            <Badge tone="inverse-accent">Recommended</Badge>
            <Badge tone="inverse">Pro Plan</Badge>
            <Badge tone="inverse" size="sm">
              Pro Plan
            </Badge>
          </div>
        </Demo>
      </DocRow>

      <Decision>
        Lime marks AI suggestions, the one status that invites action rather than reporting a state. Positive states use forest, so
        "paid" always reads as settled, not as a call to act. Drafts get their own amber tint (draft tokens: amber-100 fill, amber-700
        text, amber-600 dot), a step stronger than warning, so unsent work stands out from settled states and still reads apart from
        "Due soon".
      </Decision>
    </DocSection>
  )
}
