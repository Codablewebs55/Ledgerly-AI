import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Button, Input, Logo, useToast } from '@/ds'
import { navLinks } from '../nav-links'

const appLinks = [
  { to: '/app', label: 'Open the demo' },
  { to: '/app/invoices/new', label: 'Create an invoice' },
]

const legal = ['Privacy Policy', 'Terms & Conditions', 'Cookie Preferences']

const linkClass = 'rounded-xs text-body-sm text-fg-on-accent-muted transition-colors duration-(--duration-fast) hover:text-fg-on-accent focus-visible:outline-line-focus'

/** Lime footer: brand, newsletter sign-up, page links and the legal row. */
export function Footer() {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string>()

  // No mailing list behind this prototype: confirm the address is valid, then say plainly that nothing was sent
  const subscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter an email address like name@business.com')
      return
    }
    setError(undefined)
    setEmail('')
    toast.show({ tone: 'info', title: 'Thanks for your interest', description: 'Newsletter sign-up is not connected in this demo, so your address was not sent or stored.' })
  }

  // Legal pages are not written for the prototype yet
  const legalNotice = (label: string) => toast.show({ tone: 'info', title: `${label} is not part of this demo yet`, description: 'Ledgerly is a design prototype with sample data only.' })

  return (
    <footer className="bg-accent text-fg-on-accent">
      <div className="mx-auto grid max-w-(--ldg-content-max) gap-12 px-4 py-14 md:grid-cols-12 md:px-8 md:py-16">
        <div className="md:col-span-6 lg:col-span-5">
          <Link to="/" aria-label="Ledgerly home" className="inline-block rounded-md focus-visible:outline-line-focus">
            <Logo />
          </Link>

          <form onSubmit={subscribe} noValidate className="mt-8 max-w-[28rem]">
            <h2 id="newsletter-title" className="text-body-md font-semibold">
              Subscribe to our newsletter
            </h2>
            <p className="mt-1 text-body-sm text-fg-on-accent-muted">Product updates and practical money tips, about once a month.</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start">
              <Input
                type="email"
                aria-labelledby="newsletter-title"
                placeholder="you@business.com"
                autoComplete="email"
                value={email}
                error={error}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError(undefined)
                }}
                fieldClassName="flex-1"
              />
              <Button type="submit" variant="primary">
                Subscribe
              </Button>
            </div>
          </form>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 md:col-span-6 lg:col-span-5 lg:col-start-8">
          <div>
            <h2 className="text-label font-semibold">Product</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className={linkClass}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-label font-semibold">Try it</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {appLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      <div className="border-t border-line-on-accent">
        <div className="mx-auto flex max-w-(--ldg-content-max) flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-8">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legal.map((label) => (
              <li key={label}>
                <button type="button" onClick={() => legalNotice(label)} className="cursor-pointer rounded-xs text-caption text-fg-on-accent-muted transition-colors duration-(--duration-fast) hover:text-fg-on-accent focus-visible:outline-line-focus">
                  {label}
                </button>
              </li>
            ))}
          </ul>
          <p className="text-center text-caption text-fg-on-accent-muted">© 2026 Ledgerly. All Rights Reserved</p>
        </div>
      </div>
    </footer>
  )
}
