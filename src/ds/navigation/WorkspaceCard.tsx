import { ChevronRight, MoreHorizontal } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { defineControls } from 'tempo-sdk/assets'
import { Avatar } from '../display/Avatar'
import { Badge } from '../display/Badge'
import { cx } from '../utils/cx'
import { Popover } from './Popover'

export type WorkspaceCardProps = {
  /** Business name — also drives the avatar initials. */
  name: string
  /** Current plan, shown as a pill, e.g. "Pro Plan". */
  plan: string
  /** MenuItems for the ••• menu (account, billing, sign out). Omit to hide the button. */
  menu?: ReactNode
  /** Upgrade band along the bottom. Omit to hide it. */
  upgrade?: { label: string; to?: string; onClick?: () => void }
  className?: string
}

const bandClasses =
  'flex w-full cursor-pointer items-center gap-2.5 border-t border-line-inverse bg-inverse-sunken px-4 py-3 text-left text-body-sm text-fg-inverse-muted transition-colors duration-(--duration-fast) hover:text-fg-inverse focus-visible:-outline-offset-2 focus-visible:outline-line-focus-inverse'

/**
 * Side navigation footer: whose books these are, an account menu and an
 * upgrade prompt. Sits on the forest rail, so it only uses inverse tokens.
 * The canvas for this component is at tempo/designs/design-system/navigation/index.canvas.tsx.
 * If you adjust this component in any way, ensure the canvas and its asset
 * declaration stay consistent.
 */
export function WorkspaceCard({ name, plan, menu, upgrade, className }: WorkspaceCardProps) {
  const band = upgrade && (
    <>
      <span className="min-w-0 flex-1 truncate">{upgrade.label}</span>
      <ChevronRight className="size-4 shrink-0" aria-hidden />
    </>
  )

  return (
    <div className={cx('rounded-xl border border-line-inverse bg-inverse-raised', className)}>
      <div className="flex items-center gap-2.5 p-3">
        <Avatar name={name} shape="square" size="md" tone="accent" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-body-sm font-medium text-fg-inverse">{name}</p>
          <Badge tone="inverse" size="sm" className="mt-1 px-3!">
            {plan}
          </Badge>
        </div>
        {menu && (
          <Popover
            aria-label="Account"
            side="top"
            align="end"
            className="w-52"
            trigger={(props) => (
              <button
                type="button"
                {...props}
                aria-label={`Account menu for ${name}`}
                className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full border border-line-inverse text-fg-inverse transition-colors duration-(--duration-fast) hover:bg-inverse focus-visible:outline-line-focus-inverse"
              >
                <MoreHorizontal className="size-4" aria-hidden />
              </button>
            )}
          >
            {menu}
          </Popover>
        )}
      </div>
      {upgrade &&
        (upgrade.to ? (
          <Link to={upgrade.to} onClick={upgrade.onClick} className={cx(bandClasses, 'rounded-b-xl')}>
            {band}
          </Link>
        ) : (
          <button type="button" onClick={upgrade.onClick} className={cx(bandClasses, 'rounded-b-xl')}>
            {band}
          </button>
        ))}
    </div>
  )
}

defineControls(WorkspaceCard, {
  name: { type: 'text' },
  plan: { type: 'text' },
  menu: false,
  upgrade: false,
})
