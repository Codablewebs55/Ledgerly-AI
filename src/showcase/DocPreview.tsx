import type { CSSProperties, ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { ToastProvider } from '@/ds'
import { cx } from '@/ds/utils/cx'

const widths = { desktop: 'w-[1200px]', mobile: 'w-[390px]', page: 'w-[1280px]' }

/**
 * Wraps a docs section for isolated rendering (Tempo canvases): supplies the
 * router and toast context the app normally provides, plus a fixed width.
 */
export function DocPreview({
  children,
  width = 'desktop',
  padded = true,
  style,
}: {
  children: ReactNode
  width?: keyof typeof widths
  padded?: boolean
  style?: CSSProperties
}) {
  return (
    <MemoryRouter initialEntries={['/app/invoices']}>
      {/* One root element: Tempo sizes the frame from it. ToastProvider's
          fixed toast region lives inside, out of flow. */}
      <div style={style} className={cx('bg-canvas text-fg', widths[width], padded && (width === 'mobile' ? 'px-4 py-8' : 'p-12'))}>
        <ToastProvider>{children}</ToastProvider>
      </div>
    </MemoryRouter>
  )
}
