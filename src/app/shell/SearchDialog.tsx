import { CornerDownLeft, FileText, Plus, Search, Sparkles, User } from 'lucide-react'
import { useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router'
import { Dialog, Input, type IconComponent } from '@/ds'
import { appNav } from '../navigation'

type Result = { group: string; label: string; meta?: string; icon: IconComponent; to?: string; action?: 'assistant' }

// Pages and actions come from the nav config. Records are a small fixed
// index until the mock data store lands in Stage 4B.
const index: Result[] = [
  { group: 'Actions', label: 'Create invoice', icon: Plus, to: '/app/invoices/new' },
  { group: 'Actions', label: 'Ask Ledgerly AI', icon: Sparkles, action: 'assistant' },
  ...appNav.flatMap((s) => s.items).map((i) => ({ group: 'Pages', label: i.label, icon: i.icon, to: i.to })),
  { group: 'Invoices', label: 'INV-1042', meta: 'Northwind Studio · $12,480.50', icon: FileText, to: '/app/invoices' },
  { group: 'Invoices', label: 'INV-1041', meta: 'Harbor & Pine Co. · Overdue', icon: FileText, to: '/app/invoices' },
  { group: 'Invoices', label: 'INV-1038', meta: 'Lumen Health · $22,600.00', icon: FileText, to: '/app/invoices' },
  { group: 'Customers', label: 'Northwind Studio', meta: '3 open invoices', icon: User, to: '/app/customers' },
  { group: 'Customers', label: 'Atlas Logistics', meta: 'Paid up', icon: User, to: '/app/customers' },
]

const defaults = new Set(['Create invoice', 'Ask Ledgerly AI', 'Overview', 'Invoices', 'Banking', 'Reports'])

export type SearchDialogProps = { open: boolean; onClose: () => void; onAskAssistant: () => void }

/** Global search (⌘K): jump to a page, record or action. */
export function SearchDialog({ open, onClose, onAskAssistant }: SearchDialogProps) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const q = query.trim().toLowerCase()
  const results = q ? index.filter((r) => `${r.label} ${r.meta ?? ''} ${r.group}`.toLowerCase().includes(q)) : index.filter((r) => defaults.has(r.label))
  const groups = [...new Set(results.map((r) => r.group))]

  const close = () => {
    setQuery('')
    onClose()
  }
  const choose = (r: Result) => {
    close()
    if (r.action === 'assistant') onAskAssistant()
    else if (r.to) navigate(r.to)
  }
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && results[0]) {
      e.preventDefault()
      choose(results[0])
    }
  }

  return (
    <Dialog open={open} onClose={close} size="sm" title="Search" description="Jump to a page, record or action.">
      <Input
        icon={Search}
        aria-label="Search Ledgerly"
        placeholder="Invoices, customers, pages…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        autoComplete="off"
      />
      <div className="-mx-2 mt-4 max-h-80 overflow-y-auto" aria-live="polite">
        {results.length === 0 ? (
          <p className="px-2 py-6 text-center text-body-sm text-fg-muted">No results for “{query.trim()}”. Try an invoice number or customer name.</p>
        ) : (
          groups.map((g) => (
            <div key={g} className="mb-2">
              <p className="px-2 pt-1 pb-1.5 text-caption text-fg-subtle">{g}</p>
              <ul>
                {results
                  .filter((r) => r.group === g)
                  .map((r) => (
                    <li key={`${r.group}-${r.label}`}>
                      <button
                        type="button"
                        onClick={() => choose(r)}
                        className="group flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-left text-body-sm transition-colors duration-(--duration-fast) hover:bg-surface-hover focus-visible:-outline-offset-2"
                      >
                        <r.icon className="size-4 shrink-0 text-fg-subtle" aria-hidden />
                        <span className="min-w-0 flex-1 truncate">
                          <span className="font-medium text-fg">{r.label}</span>
                          {r.meta && <span className="text-fg-subtle"> · {r.meta}</span>}
                        </span>
                        {r === results[0] && <CornerDownLeft className="size-3.5 shrink-0 text-fg-subtle" aria-label="Enter to open" />}
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </Dialog>
  )
}
