import { Sparkles, X } from 'lucide-react'
import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import { Badge, Button, Input, Sheet, Skeleton } from '@/ds'
import { cx } from '@/ds/utils/cx'
import { pageMetaFor } from '../navigation'
import { AssistantContext, suggestionsFor, type AssistantMessage } from './assistant-context'

// Stage 4A: interface and interaction structure only. Replies are a holding
// response; grounded answers arrive with the assistant behaviour in Stage 4B.
const HOLDING_REPLY =
  "I'm reading through your books now. Detailed, data-backed answers are on the way — for now I can point you to the right place in Ledgerly."

/** Mount once inside the app shell. Owns the assistant panel and its thread. */
export function AssistantProvider({ children, defaultOpen = false }: { children: ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setOpen] = useState(defaultOpen)
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [thinking, setThinking] = useState(false)
  const seq = useRef(0)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const send = useCallback((text: string) => {
    const prompt = text.trim()
    if (!prompt) return
    setMessages((m) => [...m, { id: ++seq.current, role: 'user', text: prompt }])
    setThinking(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setMessages((m) => [...m, { id: ++seq.current, role: 'assistant', text: HOLDING_REPLY }])
      setThinking(false)
    }, 900)
  }, [])

  const value = useMemo(
    () => ({
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      ask: (prompt: string) => {
        setOpen(true)
        send(prompt)
      },
    }),
    [isOpen, send],
  )

  return (
    <AssistantContext.Provider value={value}>
      {children}
      <AssistantSheet open={isOpen} onClose={value.close} messages={messages} thinking={thinking} onSend={send} />
    </AssistantContext.Provider>
  )
}

type AssistantSheetProps = {
  open: boolean
  onClose: () => void
  messages: AssistantMessage[]
  thinking: boolean
  onSend: (text: string) => void
}

function AssistantSheet({ open, onClose, messages, thinking, onSend }: AssistantSheetProps) {
  const titleId = useId()
  const { pathname } = useLocation()
  const [draft, setDraft] = useState('')
  const thread = useRef<HTMLDivElement>(null)
  const page = pageMetaFor(pathname).title

  useEffect(() => {
    thread.current?.scrollTo({ top: thread.current.scrollHeight })
  }, [messages, thinking])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSend(draft)
    setDraft('')
  }

  return (
    <Sheet open={open} onClose={onClose} side="right" aria-labelledby={titleId}>
      <header className="flex shrink-0 items-center gap-3 border-b border-line-subtle px-5 py-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-accent-subtle text-fg-accent">
          <Sparkles className="size-4.5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 id={titleId} className="text-heading-sm">
              Ledgerly AI
            </h2>
            <Badge tone="accent" size="sm">
              Beta
            </Badge>
          </div>
          <p className="truncate text-caption text-fg-subtle">Looking at {page}</p>
        </div>
        <Button variant="ghost" icon={X} aria-label="Close Ledgerly AI" onClick={onClose} />
      </header>

      <div ref={thread} className="flex-1 overflow-y-auto px-5 py-6" aria-live="polite">
        {messages.length === 0 ? (
          <div>
            <p className="font-display text-heading-md">How can I help with your books?</p>
            <p className="mt-1.5 text-body-sm text-fg-muted">
              Ask about cash flow, invoices, expenses or reports. I'll use what's in Ledgerly to answer.
            </p>
            <p className="mt-6 mb-2 text-caption text-fg-subtle">Suggested for {page}</p>
            <ul className="flex flex-col gap-2">
              {suggestionsFor(pathname).map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => onSend(s)}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-md border border-line-control px-3 py-2.5 text-left text-body-sm text-fg transition-colors duration-(--duration-fast) hover:border-line-strong hover:bg-surface-hover"
                  >
                    <Sparkles className="size-4 shrink-0 text-fg-accent" aria-hidden />
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ol className="flex flex-col gap-5">
            {messages.map((m) => (
              <li key={m.id} className={cx('flex', m.role === 'user' ? 'justify-end' : 'gap-3')}>
                {m.role === 'assistant' && (
                  <span className="grid size-7 shrink-0 place-items-center rounded-md bg-accent-subtle text-fg-accent">
                    <Sparkles className="size-3.5" aria-hidden />
                  </span>
                )}
                <p
                  className={cx(
                    'text-body-sm',
                    m.role === 'user' ? 'max-w-[85%] rounded-lg rounded-br-xs bg-brand-subtle px-3.5 py-2.5 text-fg' : 'min-w-0 flex-1 pt-1 text-fg',
                  )}
                >
                  <span className="sr-only">{m.role === 'user' ? 'You: ' : 'Ledgerly AI: '}</span>
                  {m.text}
                </p>
              </li>
            ))}
            {thinking && (
              <li className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-md bg-accent-subtle text-fg-accent">
                  <Sparkles className="size-3.5" aria-hidden />
                </span>
                <div className="flex flex-1 flex-col gap-2 pt-1.5">
                  <span className="sr-only">Ledgerly AI is thinking</span>
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-3 w-3/5" />
                </div>
              </li>
            )}
          </ol>
        )}
      </div>

      <form onSubmit={submit} className="shrink-0 border-t border-line-subtle px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Input
          data-autofocus
          size="lg"
          aria-label="Message Ledgerly AI"
          placeholder="Ask about your books…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoComplete="off"
          action={<Button type="submit" size="sm" icon={Sparkles} aria-label="Send message" disabled={!draft.trim() || thinking} />}
        />
        <p className="mt-2 text-caption text-fg-subtle opacity-70">Ledgerly AI can make mistakes. Check important figures before acting on them.</p>
      </form>
    </Sheet>
  )
}
