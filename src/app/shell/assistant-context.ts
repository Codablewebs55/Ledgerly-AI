import { createContext, useContext } from 'react'

export type AssistantMessage = { id: number; role: 'user' | 'assistant'; text: string }

export type AssistantContextValue = {
  isOpen: boolean
  open: () => void
  close: () => void
  /** Open the panel and send a prompt — for insight cards and suggestions. */
  ask: (prompt: string) => void
}

export const AssistantContext = createContext<AssistantContextValue | null>(null)

/** Open Ledgerly AI from any screen inside the app shell. */
export function useAssistant() {
  const ctx = useContext(AssistantContext)
  if (!ctx) throw new Error('useAssistant must be used inside <AssistantProvider>')
  return ctx
}

const suggestions: [prefix: string, prompts: string[]][] = [
  ['/app/invoices', ['Draft a reminder for overdue invoices', 'Which clients usually pay late?', 'What is still outstanding this month?']],
  ['/app/expenses', ['What were my biggest expenses this month?', 'Find possible duplicate receipts', 'Which expenses are missing a category?']],
  ['/app/transactions', ['Suggest categories for new transactions', 'Explain unusual transactions this week']],
  ['/app/banking', ['Explain my unmatched transactions', 'How far behind is my reconciliation?']],
  ['/app/reports', ['Explain my profit and loss in plain English', 'Compare this quarter with last quarter']],
  ['/app/customers', ['Which customers owe me the most?', 'Who are my most valuable customers this year?']],
  ['/app', ['Summarise my cash flow this month', 'Which invoices need attention?', 'How much should I set aside for tax?']],
]

/** Starter prompts that match the page the person is looking at. */
export function suggestionsFor(pathname: string) {
  return (suggestions.find(([prefix]) => pathname.startsWith(prefix)) ?? suggestions[suggestions.length - 1])[1]
}
