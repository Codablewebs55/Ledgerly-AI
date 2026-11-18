import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cx } from '@/ds/utils/cx'
import { MOTION_ENABLED } from './motion'
import type { Still } from './stills'


/** One lime italic word inside a heading, the page's single accent per title. */
export function Accent({ children, inverse }: { children: ReactNode; inverse?: boolean }) {
  return <em className={cx('font-medium', inverse ? 'text-fg-inverse-accent' : 'text-fg-brand')}>{children}</em>
}

type SectionHeadingProps = {
  id: string
  eyebrow?: string
  title: ReactNode
  intro?: ReactNode
  inverse?: boolean
  align?: 'start' | 'split'
  className?: string
}

/**
 * Section title block. `split` puts the intro in a right-hand column on large screens, the asymmetric layout used
 * across the page; `start` stacks it under the title.
 */
export function SectionHeading({ id, eyebrow, title, intro, inverse, align = 'split', className }: SectionHeadingProps) {
  return (
    <div className={cx('grid gap-5', align === 'split' && 'lg:grid-cols-12 lg:items-end lg:gap-10', className)}>
      <div className={cx(align === 'split' && 'lg:col-span-7')}>
        {eyebrow && <p className={cx('mb-4 text-label font-medium', inverse ? 'text-fg-inverse-accent' : 'text-fg-brand')}>{eyebrow}</p>}
        <h2 id={id} className={cx('font-display text-display-lg md:text-display-xl', inverse ? 'text-fg-inverse' : 'text-fg')}>
          {title}
        </h2>
      </div>
      {intro && (
        <p style={{ visibility: "hidden" }} className={cx('max-w-[34rem] text-body-md md:text-body-lg', inverse ? 'text-fg-inverse-muted' : 'text-fg-muted', align === 'split' && 'lg:col-span-5 lg:pb-2')}>
          {intro}
        </p>
      )}
    </div>
  )
}

type ShotProps = {
  still: Still
  alt: string
  /** `window` adds a slim title bar, for full screens; `card` is a bare rounded crop, for app fragments. */
  frame?: 'window' | 'card'
  className?: string
  imgClassName?: string
}

/** A framed, lazily loaded product still. */
export function Shot({ still, alt, frame = 'card', className, imgClassName }: ShotProps) {
  return (
    <div
      className={cx('overflow-hidden border', frame === 'window' ? 'rounded-xl border-line-strong bg-inverse-sunken' : 'rounded-lg border-line bg-surface', className)}
      style={/\b(absolute|fixed|sticky)\b/.test(className ?? '') ? undefined : { position: 'relative' }}
    >
      {frame === 'window' && (
        <div aria-hidden className="flex h-6 items-center gap-1.5 px-3">
          <span className="size-2 rounded-full bg-inverse-raised" />
          <span className="size-2 rounded-full bg-inverse-raised" />
          <span className="size-2 rounded-full bg-inverse-raised" />
        </div>
      )}
      <img src={still.src} width={still.w} height={still.h} alt={alt} loading="lazy" decoding="async" className={cx('block w-full', imgClassName)} />
    </div>
  )
}

/**
 * Fades and lifts its children in the first time they scroll into view. Under reduced motion the duration tokens
 * collapse to zero, so content simply appears.
 */
export function Reveal({ children, delay = 0, className, as: Tag = 'div' }: { children: ReactNode; delay?: number; className?: string; as?: 'div' | 'li' }) {
  const ref = useRef<HTMLDivElement & HTMLLIElement>(null)
  const [shown, setShown] = useState(!MOTION_ENABLED)
  useEffect(() => {
    const el = ref.current
    if (!el || !MOTION_ENABLED) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        setShown(true)
        io.disconnect()
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <Tag ref={ref} data-reveal={delay} className={cx(MOTION_ENABLED && (shown ? 'animate-rise-in' : 'opacity-0'), className)} style={MOTION_ENABLED && shown && delay ? { animationDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  )
}
