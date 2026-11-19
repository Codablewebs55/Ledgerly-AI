import { ArrowRight, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Button, Logo, Sheet } from '@/ds'
import { cx } from '@/ds/utils/cx'
import { navLinks } from './nav-links'

/**
 * Marketing header on the forest hero. Transparent at the top of the page,
 * it gains the inverse surface and a hairline once the visitor scrolls.
 * Below 1024px the links move into a sheet behind a menu button.
 */
export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cx(
        'sticky top-0 z-40 border-b transition-colors duration-(--duration-slow) ease-(--ease-standard)',
        scrolled ? 'border-line-inverse bg-inverse' : 'border-transparent bg-transparent',
      )}
    >
      <nav aria-label="Main" className="relative mx-auto flex h-(--ldg-marketing-nav-height) max-w-(--ldg-content-max) items-center gap-8 px-4 md:px-8">
        <Link to="/" aria-label="Ledgerly home" className="shrink-0 rounded-md focus-visible:outline-line-focus-inverse">
          <Logo tone="inverse" />
        </Link>

        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-md px-3 py-2 text-body-sm font-medium text-fg-inverse-muted transition-colors duration-(--duration-fast) hover:text-fg-inverse focus-visible:outline-line-focus-inverse"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/app"
            className="hidden rounded-md px-3 py-2 text-body-sm font-medium text-fg-inverse transition-colors duration-(--duration-fast) hover:text-fg-inverse-accent focus-visible:outline-line-focus-inverse sm:block"
          >
            Sign in
          </Link>
          <Button to="/app" variant="accent" size="sm" icon={ArrowRight} iconPosition="end" className="max-[359px]:hidden">
            Get started
          </Button>
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="grid size-11 place-items-center rounded-md text-fg-inverse hover:bg-inverse-raised focus-visible:outline-line-focus-inverse lg:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </button>
        </div>
      </nav>

      <Sheet open={open} onClose={() => setOpen(false)} side="right" aria-label="Menu">
        <div className="flex h-16 items-center justify-between border-b border-line px-4">
          <Logo />
          <Button variant="ghost" icon={X} aria-label="Close menu" data-autofocus onClick={() => setOpen(false)} />
        </div>
        <ul className="flex flex-col px-2 py-4">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)} className="flex h-12 items-center rounded-md px-3 font-display text-heading-md text-fg hover:bg-surface-hover">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-col gap-3 border-t border-line p-4">
          <Button to="/app" variant="primary" size="lg" fullWidth icon={ArrowRight} iconPosition="end">
            Get started for free
          </Button>
          <Button to="/app" variant="secondary" size="lg" fullWidth>
            Sign in
          </Button>
        </div>
      </Sheet>
    </header>
  )
}
