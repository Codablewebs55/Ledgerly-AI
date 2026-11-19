import { BellRing, Copy, Download, Eye, Send } from 'lucide-react'
import { MenuItem, MenuSeparator, RowActions, useToast } from '@/ds'
import { clientName, statusOf } from '../data/invoices'
import type { Invoice } from '../data/types'

/** Overflow menu for one invoice row (dashboard and invoice list). The main action follows the status; the rest are simulated. */
export function InvoiceRowActions({ inv }: { inv: Invoice }) {
  const { show } = useToast()
  const status = statusOf(inv)
  const simulated = (title: string) => show({ tone: 'info', title, description: 'Simulated in this prototype.' })
  return (
    <RowActions label={`Actions for ${inv.number}`}>
      <MenuItem icon={Eye} to="/app/invoices">
        View invoice
      </MenuItem>
      {status === 'draft' ? (
        <MenuItem icon={Send} onSelect={() => simulated(`${inv.number} sent to ${clientName(inv.clientId)}`)}>
          Send invoice
        </MenuItem>
      ) : status !== 'paid' && status !== 'void' ? (
        <MenuItem icon={BellRing} onSelect={() => simulated(`Reminder sent for ${inv.number}`)}>
          Send reminder
        </MenuItem>
      ) : null}
      <MenuItem icon={Download} onSelect={() => simulated(`Downloading ${inv.number}.pdf`)}>
        Download PDF
      </MenuItem>
      <MenuSeparator />
      <MenuItem icon={Copy} onSelect={() => simulated(`${inv.number} duplicated as a draft`)}>
        Duplicate
      </MenuItem>
    </RowActions>
  )
}
