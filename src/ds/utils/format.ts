// Formatting shared by Money and screens that need a plain string (CSV, aria).

export type MoneyFormatOptions = {
  currency?: string
  /** Prefix positive values with "+". */
  signed?: boolean
  /** $184.3K style — for chart axes and dense summaries only. */
  compact?: boolean
  /** Hide cents (whole-dollar KPIs). */
  wholeUnits?: boolean
}

const formatters = new Map<string, Intl.NumberFormat>()

/** Format an amount. Uses a true minus sign (U+2212) for typographic balance. */
export function formatMoney(amount: number, { currency = 'USD', signed = false, compact = false, wholeUnits = false }: MoneyFormatOptions = {}) {
  const key = `${currency}|${signed}|${compact}|${wholeUnits}`
  let f = formatters.get(key)
  if (!f) {
    f = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      notation: compact ? 'compact' : 'standard',
      signDisplay: signed ? 'exceptZero' : 'auto',
      minimumFractionDigits: compact || wholeUnits ? 0 : 2,
      maximumFractionDigits: compact ? 1 : wholeUnits ? 0 : 2,
    })
    formatters.set(key, f)
  }
  return f.format(amount).replace('-', '−')
}

/** Two-letter initials: first + last word, or first two letters of one word. */
export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : (parts[0]?.[1] ?? ''))).toUpperCase()
}
