import { useEffect, useRef, useState } from 'react'
import { cx } from '@/ds/utils/cx'
import { useOsReducedMotion } from './motion'

// A small Ledgerly AI magician that keeps the visitor company down the page. It sits in the bottom-right corner,
// its eyes follow the heading of whichever section is in the middle of the screen, and as each new section arrives
// it gives its wand a flick and says one short line about it. Decorative only: hidden from assistive tech, and it
// never blocks clicks. Under reduced motion it stops bobbing and flicking but still looks and speaks.

/** One line per section, keyed by the id of the section's heading */
const LINES: Record<string, string> = {
  'hero-title': "Hi, I'm Ledgerly AI.",
  'value-title': 'All your money, one place.',
  'features-title': 'Invoices, expenses, banking.',
  'assistant-title': "That's me in there!",
  'workflow-title': 'Each step feeds the next.',
  'personas-title': 'Made for people like you.',
  'testimonials-title': 'Kind words from our personas.',
  'pricing-title': 'Start free, no card needed.',
  'faq-title': 'Ask me anything.',
  'cta-title': 'Ready when you are.',
}

/** How far the pupils can travel from the centre of each eye, in drawing units */
const LOOK = 1.4
/** How long a line stays up */
const SAY_MS = 2800

export function AiMagician() {
  const reduced = useOsReducedMotion()
  const figure = useRef<HTMLDivElement>(null)
  const pupils = useRef<SVGGElement>(null)
  const [active, setActive] = useState<string | null>(null)
  // The last line stays in the bubble while it fades out; `speaking` controls whether it shows
  const [line, setLine] = useState('')
  const [speaking, setSpeaking] = useState(false)
  const [flick, setFlick] = useState(false)
  const timers = useRef<number[]>([])

  // Which section is in the middle of the screen. When it changes, say its line and flick the wand.
  useEffect(() => {
    let current: string | null = null
    const announce = (id: string) => {
      if (id === current) return
      current = id
      setActive(id)
      setLine(LINES[id])
      setSpeaking(true)
      setFlick(true)
      timers.current.forEach(clearTimeout)
      timers.current = [window.setTimeout(() => setSpeaking(false), SAY_MS), window.setTimeout(() => setFlick(false), 500)]
    }
    const headings = Object.keys(LINES)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el)
    const sections = headings.map((h) => h.closest('section') ?? h)
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const i = sections.indexOf(e.target as HTMLElement)
          if (i >= 0) announce(headings[i].id)
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    const pending = timers
    return () => {
      io.disconnect()
      pending.current.forEach(clearTimeout)
    }
  }, [])

  // Keep the eyes on the active section's heading as the page moves. Positions are measured once (and again on
  // resize), so scrolling only does arithmetic: no layout reads while the page is moving.
  useEffect(() => {
    const me = figure.current
    const eyes = pupils.current
    const heading = active ? document.getElementById(active) : null
    if (!me || !eyes || !heading) return
    let eye = { x: 0, y: 0 } // the magician's eyes, in the viewport (it is fixed in place)
    let target = { x: 0, y: 0 } // the heading's centre, on the page
    const measure = () => {
      const from = me.getBoundingClientRect()
      const to = heading.getBoundingClientRect()
      eye = { x: from.left + from.width / 2, y: from.top + from.height * 0.45 }
      target = { x: to.left + Math.min(to.width, 320) / 2, y: to.top + scrollY + to.height / 2 }
    }
    let raf = 0
    const look = () => {
      raf = 0
      const dx = target.x - eye.x
      const dy = target.y - scrollY - eye.y
      const d = Math.hypot(dx, dy) || 1
      eyes.setAttribute('transform', `translate(${((dx / d) * LOOK).toFixed(2)} ${((dy / d) * LOOK).toFixed(2)})`)
    }
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(look)
    }
    const onResize = () => {
      measure()
      wake()
    }
    measure()
    look()
    addEventListener('scroll', wake, { passive: true })
    addEventListener('resize', onResize)
    return () => {
      removeEventListener('scroll', wake)
      removeEventListener('resize', onResize)
      cancelAnimationFrame(raf)
    }
  }, [active])

  return (
    <div aria-hidden className="pointer-events-none fixed right-3 bottom-3 z-30 flex items-end gap-2 md:right-6 md:bottom-6">
      {/* What it says about the section */}
      <p
        className={cx(
          'mb-2 max-w-48 rounded-lg rounded-br-xs bg-inverse px-3 py-1.5 text-caption text-fg-inverse shadow-md transition-[opacity,translate] duration-(--duration-slow) ease-(--ease-standard)',
          speaking ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
        )}
      >
        {line}
      </p>

      <div ref={figure} className="grid size-12 shrink-0 place-items-center rounded-full border border-line bg-surface-raised shadow-md md:size-14">
        <svg viewBox="0 0 48 48" className="size-10 overflow-visible md:size-12">
          <g>
            {!reduced && <animateTransform attributeName="transform" type="translate" values="0 0;0 -1.2;0 0" dur="3s" repeatCount="indefinite" />}

            {/* Robe */}
            <path d="M13 46c2-10 7-13 11-13s9 3 11 13z" className="fill-brand" />
            {/* Face and beard */}
            <circle cx="24" cy="27" r="7.5" className="fill-accent-subtle" />
            <path d="M17.5 29c2 9 11 9 13 0-4 2.5-9 2.5-13 0z" className="fill-surface" />
            {/* Eyes, with pupils that look toward the section */}
            <g ref={pupils}>
              {[21, 27].map((x) => (
                <ellipse key={x} cx={x} cy="25.5" rx="1.5" ry="1.8" className="fill-fg">
                  <animate attributeName="ry" values="1.8;1.8;0.2;1.8" keyTimes="0;0.93;0.96;1" dur="4.5s" repeatCount="indefinite" />
                </ellipse>
              ))}
            </g>
            {/* Hat with a lime star */}
            <path d="M13 21 23 3.5c.5-.8 1.5-.8 2 0L35 21z" className="fill-brand" />
            <ellipse cx="24" cy="21" rx="13" ry="2.6" className="fill-brand" />
            <path d="m25 10 1 2.1 2.3.3-1.7 1.6.4 2.3-2-1.1-2 1.1.4-2.3-1.7-1.6 2.3-.3z" className="fill-accent" />

            {/* Wand, flicked when a new section arrives */}
            <g
              className="transition-transform duration-(--duration-base) ease-(--ease-standard)"
              style={{ transformOrigin: '34px 39px', transform: flick && !reduced ? 'rotate(-28deg)' : 'rotate(0deg)' }}
            >
              <path d="M34 39 42 28" strokeWidth="2" strokeLinecap="round" className="stroke-fg-brand" />
              <circle cx="42.5" cy="27.3" r="1.8" className="fill-accent" />
              <path
                d="M45 23.5v2M46 24.5h-2M39.5 22v1.6M40.3 22.8h-1.6"
                strokeWidth="1"
                strokeLinecap="round"
                className={cx('stroke-accent transition-opacity duration-(--duration-slow)', flick ? 'opacity-100' : 'opacity-0')}
              />
            </g>
          </g>
        </svg>
      </div>
    </div>
  )
}
