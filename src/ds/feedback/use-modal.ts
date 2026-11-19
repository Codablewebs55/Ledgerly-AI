import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'

const focusable = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

/**
 * Shared behaviour for modal surfaces (Dialog, Sheet): moves focus inside,
 * traps Tab, closes on Escape, locks page scroll and restores focus on close.
 * `pickInitial` chooses which focusable element receives focus first.
 */
export function useModal(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
  pickInitial?: (items: HTMLElement[], root: HTMLElement) => HTMLElement | null | undefined,
) {
  // Callers often pass inline functions; keep the latest without re-running
  // the effect (which would steal focus on every render).
  const latest = useRef({ onClose, pickInitial })
  useLayoutEffect(() => {
    latest.current = { onClose, pickInitial }
  })

  useEffect(() => {
    if (!open) return
    const root = ref.current
    if (!root) return
    const previous = document.activeElement as HTMLElement | null
    const items = () => Array.from(root.querySelectorAll<HTMLElement>(focusable))
    const initial = latest.current.pickInitial?.(items(), root) ?? items()[0] ?? root
    initial.focus()
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') latest.current.onClose()
      if (e.key !== 'Tab') return
      const list = items()
      if (!list.length) return
      const first = list[0]
      const last = list[list.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [open, ref])
}
