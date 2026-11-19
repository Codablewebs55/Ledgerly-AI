import { createContext, useContext, type ReactNode } from 'react'

export type ToastTone = 'success' | 'info' | 'error'

export type ToastOptions = {
  title: string
  description?: ReactNode
  tone?: ToastTone
  /** e.g. { label: 'View invoice', onClick } */
  action?: { label: string; onClick: () => void }
  /** ms before auto-dismiss. Default 5000. */
  duration?: number
}

export type ToastApi = { show: (t: ToastOptions) => void; dismiss: (id: number) => void }

export const ToastContext = createContext<ToastApi | null>(null)

/** Show transient confirmations. Requires <ToastProvider> at the app root. */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
