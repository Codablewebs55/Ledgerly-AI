type LogoProps = {
  /** `default` for light surfaces, `inverse` for bg-inverse / bg-brand. */
  tone?: 'default' | 'inverse'
  /** Hide the wordmark to use the mark alone (favicons, collapsed nav). */
  markOnly?: boolean
  className?: string
}

/**
 * Ledgerly mark: a forest tile holding two ledger rules and a lime upward
 * tick — "the books, balanced and moving forward".
 */
export function LogoMark({ tone = 'default', className = 'size-8' }: Omit<LogoProps, 'markOnly'>) {
  return (
    <svg viewBox="0 0 32 32" role="img" aria-label="Ledgerly" className={className}>
      <rect width="32" height="32" rx="9" className={tone === 'inverse' ? 'fill-accent' : 'fill-brand'} />
      <path
        d="M9 21.5h14M9 16.5h6"
        strokeWidth="2.4"
        strokeLinecap="round"
        className={tone === 'inverse' ? 'stroke-fg-on-accent' : 'stroke-fg-on-brand'}
      />
      <path
        d="m17.5 15.5 3-3.5 2.5 2"
        fill="none"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={tone === 'inverse' ? 'stroke-brand' : 'stroke-accent'}
      />
    </svg>
  )
}

export function Logo({ tone = 'default', markOnly = false, className = '' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark tone={tone} />
      {!markOnly && (
        <span
          className={`font-display text-heading-md font-extrabold tracking-[-0.03em] ${tone === 'inverse' ? 'text-fg-inverse' : 'text-fg'}`}
        >
          Ledgerly
        </span>
      )}
    </span>
  )
}
