import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { Link } from 'react-router'
import { defineControls } from 'tempo-sdk/assets'
import { cx } from '../utils/cx'
import type { IconComponent } from '../utils/types'

type PopoverContextValue = { close: () => void; role: 'menu' | 'dialog' }
const PopoverContext = createContext<PopoverContextValue | null>(null)

export type PopoverTriggerProps = {
  'aria-expanded': boolean
  'aria-haspopup': 'menu' | 'dialog'
  'aria-controls': string
  onClick: () => void
}

export type PopoverProps = {
  /** Render the trigger (usually a Button) and spread the props onto it. */
  trigger: (props: PopoverTriggerProps) => ReactNode
  /** Panel content. A function receives `close`, for custom actions. */
  children: ReactNode | ((close: () => void) => ReactNode)
  /** `menu` for lists of actions (MenuItem); `dialog` for richer panels. */
  role?: 'menu' | 'dialog'
  'aria-label': string
  align?: 'start' | 'end'
  side?: 'bottom' | 'top'
  /** Panel width etc. Defaults to w-64. */
  className?: string
  /** Start open — for docs and canvas previews. */
  defaultOpen?: boolean
  /** `fixed` positions the panel against the viewport so it escapes `overflow-hidden` parents (table rows, cards).
   *  It flips above the trigger when there is no room below, and closes on scroll or resize. */
  strategy?: 'absolute' | 'fixed'
}

const itemSelector = '[role="menuitem"]'

/**
 * Small anchored panel: profile menu, notifications, row actions.
 * Closes on outside click, Escape (returning focus to the trigger) and after
 * a MenuItem is chosen. Menus support arrow-key movement.
 * The canvas for this component is at tempo/designs/design-system/navigation/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function Popover({ trigger, children, role = 'menu', align = 'end', side = 'bottom', className, defaultOpen = false, strategy = 'absolute', ...aria }: PopoverProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [fixedStyle, setFixedStyle] = useState<CSSProperties>()
  const id = useId()
  const wrapper = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  const close = useCallback((refocus = false) => {
    setOpen(false)
    if (refocus) wrapper.current?.querySelector<HTMLElement>('button,a')?.focus()
  }, [])

  // Only move focus into menus the person opened (not defaultOpen previews).
  const [openedByTrigger, setOpenedByTrigger] = useState(false)
  useEffect(() => {
    if (!open) return
    if (role === 'menu' && openedByTrigger) panel.current?.querySelector<HTMLElement>(itemSelector)?.focus()
    const onPointer = (e: PointerEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [open, role, openedByTrigger])

  // Fixed strategy: anchor to the trigger's viewport rect, flipping above when the panel would run off-screen.
  useLayoutEffect(() => {
    if (!open || strategy !== 'fixed' || !wrapper.current) return
    const r = wrapper.current.getBoundingClientRect()
    const h = panel.current?.offsetHeight ?? 0
    const above = side === 'top' || (r.bottom + 8 + h > window.innerHeight && r.top - 8 - h > 0)
    setFixedStyle({
      position: 'fixed',
      ...(above ? { bottom: window.innerHeight - r.top + 8 } : { top: r.bottom + 8 }),
      ...(align === 'end' ? { right: window.innerWidth - r.right } : { left: r.left }),
    })
    const dismiss = () => setOpen(false)
    window.addEventListener('scroll', dismiss, true)
    window.addEventListener('resize', dismiss)
    return () => {
      window.removeEventListener('scroll', dismiss, true)
      window.removeEventListener('resize', dismiss)
    }
  }, [open, strategy, side, align])

  const onKeyDown = (e: KeyboardEvent) => {
    if (!open) return
    if (e.key === 'Escape') {
      // Keep Escape from also closing a surrounding Sheet or Dialog.
      e.stopPropagation()
      close(true)
      return
    }
    if (role !== 'menu' || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return
    const items = Array.from(panel.current?.querySelectorAll<HTMLElement>(itemSelector) ?? [])
    if (!items.length) return
    e.preventDefault()
    const i = items.indexOf(document.activeElement as HTMLElement)
    const next =
      e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : e.key === 'ArrowDown' ? (i + 1) % items.length : (i - 1 + items.length) % items.length
    items[next].focus()
  }

  const toggle = useCallback(() => {
    setOpenedByTrigger(true)
    setOpen((o) => !o)
  }, [])

  const ctx = useMemo<PopoverContextValue>(() => ({ close: () => setOpen(false), role }), [role])

  return (
    <div ref={wrapper} className="relative h-fit" onKeyDown={onKeyDown}>
      {trigger({ 'aria-expanded': open, 'aria-haspopup': role, 'aria-controls': id, onClick: toggle })}
      {open && (
        <div
          ref={panel}
          id={id}
          role={role}
          {...aria}
          style={strategy === 'fixed' ? (fixedStyle ?? { position: 'fixed', visibility: 'hidden' }) : undefined}
          className={cx(
            'z-50 max-w-[calc(100vw-2rem)] rounded-lg border border-line bg-surface-raised p-1.5 text-fg shadow-lg motion-safe:animate-menu-in',
            strategy === 'absolute' && 'absolute',
            strategy === 'absolute' && (side === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'),
            strategy === 'absolute' && (align === 'end' ? 'right-0' : 'left-0'),
            className ?? 'w-64',
          )}
        >
          <PopoverContext.Provider value={ctx}>{typeof children === 'function' ? children(ctx.close) : children}</PopoverContext.Provider>
        </div>
      )}
    </div>
  )
}

export type MenuItemProps = {
  children: ReactNode
  icon?: IconComponent
  /** Second line, e.g. an amount or timestamp. */
  description?: ReactNode
  /** Navigate (router link) … */
  to?: string
  /** … or run an action. The popover closes either way. */
  onSelect?: () => void
  tone?: 'default' | 'danger'
  /** Colour the icon by meaning, e.g. `text-fg-positive` for a payment. */
  iconClassName?: string
  /** Right-hand slot: shortcut, count or unread dot. */
  trailing?: ReactNode
  className?: string
}

/**
 * A row inside a Popover. Acts as `menuitem` in menus and as a plain link or
 * button in dialog-style panels (notifications).
 * The canvas for this component is at tempo/designs/design-system/navigation/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function MenuItem({ children, icon: Icon, description, to, onSelect, tone = 'default', iconClassName, trailing, className }: MenuItemProps) {
  const ctx = useContext(PopoverContext)
  const select = () => {
    onSelect?.()
    ctx?.close()
  }
  const classes = cx(
    'flex w-full cursor-pointer items-start gap-3 rounded-md px-2.5 py-2 text-left text-body-sm transition-colors duration-(--duration-fast) hover:bg-surface-hover focus-visible:-outline-offset-2',
    tone === 'danger' ? 'text-fg-negative' : 'text-fg',
    className,
  )
  const content = (
    <>
      {Icon && <Icon className={cx('mt-0.5 size-4 shrink-0', tone === 'danger' ? 'text-fg-negative' : (iconClassName ?? 'text-fg-subtle'))} aria-hidden />}
      <span className="min-w-0 flex-1">
        <span className="block">{children}</span>
        {description && <span className="mt-0.5 block text-caption text-fg-subtle">{description}</span>}
      </span>
      {trailing && <span className="flex shrink-0 items-center self-center">{trailing}</span>}
    </>
  )
  const role = ctx?.role === 'menu' ? 'menuitem' : undefined
  const tabIndex = role ? -1 : undefined

  return to ? (
    <Link to={to} role={role} tabIndex={tabIndex} onClick={select} className={classes}>
      {content}
    </Link>
  ) : (
    <button type="button" role={role} tabIndex={tabIndex} onClick={select} className={classes}>
      {content}
    </button>
  )
}

/** Divider between groups of MenuItems. */
export function MenuSeparator() {
  return <div role="separator" className="-mx-1.5 my-1.5 h-px bg-line-subtle" />
}

defineControls(Popover, {
  role: { type: 'select' },
  align: { type: 'select' },
  side: { type: 'select' },
  defaultOpen: { type: 'boolean' },
  strategy: { type: 'select' },
  trigger: false,
  children: false,
}); // ← keep: Tempo's HMR wrapper chains consecutive defineControls calls without ASI

defineControls(MenuItem, {
  children: { type: 'text' },
  description: { type: 'text' },
  tone: { type: 'select' },
  to: { type: 'text' },
  icon: false,
  onSelect: false,
  trailing: false,
})
