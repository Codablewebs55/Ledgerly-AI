import { ArrowDown, ArrowRight } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '@/ds'
import { cx } from '@/ds/utils/cx'
import { MOTION_ENABLED, useEasedScroll, useOsReducedMotion, useReducedMotion, useScrollProgress } from './motion'
import { MouseField } from './MouseField'

// Product stills are captured from the running app by
// scripts/marketing/capture-stills.mjs (2x, seed data). Sizes are CSS px.
const shots = {
  overview: { src: '/marketing/overview-desktop.webp', w: 1440, h: 1474 },
  overviewMobile: { src: '/marketing/overview-mobile.webp', w: 390, h: 844 },
}

/**
 * Hero copy trails the page as it scrolls away and fades out. `--y` is an eased copy of the scroll offset, so even a
 * quick flick of the wheel reads as a slow glide; `rate` is the share of that offset the copy holds back by.
 */
const glide = (rate: number) => ({
  transform: `translate3d(0, calc(var(--y, 0) * ${rate}px), 0)`,
  opacity: 'clamp(0, calc(1 - var(--y, 0) / 520), 1)',
  willChange: 'transform, opacity',
})

// The screen settles gently toward full size as the hero scrolls through
const screenMotion = { transform: 'translateY(calc((0.5 - var(--p, 0.5)) * 36px)) scale(calc(0.97 + var(--p, 0.5) * 0.04))', transformOrigin: '50% 0' }

export function Hero() {
  const stage = useRef<HTMLDivElement>(null)
  const copy = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  // The field keeps moving even with the page-wide motion switch off; only the visitor's OS setting stills it
  const osReduced = useOsReducedMotion()
  useScrollProgress(stage)
  useEasedScroll(copy)

  return (
    <section aria-labelledby="hero-title" className="relative -mt-(--ldg-marketing-nav-height) overflow-x-clip bg-inverse pt-(--ldg-marketing-nav-height) text-fg-inverse">
      <div className="mx-auto max-w-(--ldg-content-max) px-4 pt-14 md:px-8 md:pt-20 lg:pt-24">
        <div ref={copy} className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h1
            id="hero-title"
            className="font-display text-display-lg text-fg-inverse md:text-display-xl lg:col-span-7 lg:text-display-2xl"
            style={reduced ? undefined : glide(0.35)}
          >
            <span className={cx('block', MOTION_ENABLED && 'animate-rise-in')}>Your business finances.</span>
            <span className={cx('block', MOTION_ENABLED && 'animate-rise-in [animation-delay:180ms]')}>
              <em className="font-medium text-fg-inverse-accent">Finally,</em> in control.
            </span>
          </h1>
          <div className={cx('lg:col-span-5 lg:pb-2', MOTION_ENABLED && 'animate-rise-in [animation-delay:360ms]')} style={reduced ? undefined : glide(0.2)}>
            <p className="max-w-(--ldg-prose-max) text-body-md text-fg-inverse-muted md:text-body-lg">
              From invoices and expenses to banking and financial insights, Ledgerly brings everything together so you can understand your numbers, automate the busywork and make
              better business decisions.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button to="/app" variant="accent" size="lg" icon={ArrowRight} iconPosition="end">
                Get started for free
              </Button>
              <Button
                variant="inverse"
                size="lg"
                icon={ArrowDown}
                iconPosition="end"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })}
              >
                Explore Ledgerly
              </Button>
            </div>
            <p className="mt-4 text-caption text-fg-inverse-subtle">No card needed. Opens a demo workspace with sample data.</p>
          </div>
        </div>

        {/* Product stage: the Overview rises out of a cursor-led contour field and is cropped by the stage floor. On load the
            stage swings upright in 3D. */}
        <div ref={stage} id="product" className="relative mt-14 scroll-mt-24 pb-12 md:mt-16 md:pb-16 lg:mt-20 lg:pb-24">
          <figure className={cx('relative overflow-hidden rounded-2xl border border-line-inverse bg-inverse-raised md:aspect-[16/10] lg:aspect-[1216/550]', MOTION_ENABLED && 'animate-stage-in [animation-delay:240ms]')}>
            <MouseField still={osReduced} className="absolute inset-0" />

            {/* Tablet and desktop: the Overview in a window frame, running off the bottom of the stage */}
            <div className="relative hidden px-[6%] pt-[6%] md:block lg:px-[8%]">
              <div className="relative" style={reduced ? undefined : screenMotion}>
                <div className="overflow-hidden rounded-xl border border-line-inverse bg-inverse-sunken shadow-xl">
                  <div aria-hidden className="flex h-7 items-center gap-1.5 px-3">
                    <span className="size-2.5 rounded-full bg-inverse-raised" />
                    <span className="size-2.5 rounded-full bg-inverse-raised" />
                    <span className="size-2.5 rounded-full bg-inverse-raised" />
                  </div>
                  <img
                    src={shots.overview.src}
                    width={shots.overview.w}
                    height={shots.overview.h}
                    alt="Ledgerly Overview: cash on hand $133,912.40, outstanding $52,850.48, overdue $19,950.48, a six-month cash flow chart, three Ledgerly AI insights, recent invoices and what needs attention."
                    {...{ fetchpriority: 'high' }}
                    decoding="async"
                    className="block w-full"
                  />
                </div>
              </div>
            </div>

            {/* Phone: the app's own mobile Overview, framed like a screen rising out of the field */}
            <div className="relative h-[27rem] md:hidden">
              <img
                src={shots.overviewMobile.src}
                width={shots.overviewMobile.w}
                height={shots.overviewMobile.h}
                alt="Ledgerly on a phone: Overview with cash on hand $133,912.40 and outstanding $52,850.48."
                {...{ fetchpriority: 'high' }}
                decoding="async"
                className="absolute top-8 left-1/2 w-[min(17rem,84%)] -translate-x-1/2 rounded-t-[1.75rem] border-x-[6px] border-t-[6px] border-inverse-sunken shadow-xl"
              />
            </div>
            <figcaption className="sr-only">The Ledgerly Overview, the first screen you see each day.</figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
