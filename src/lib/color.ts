// WCAG 2.x relative luminance + contrast ratio for #rrggbb values.
// Mirrors scripts/check-tokens.mjs, which gates the token files in CI;
// this copy lets docs pages show live ratios.

function channel(c: number) {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

export function luminance(hex: string) {
  const h = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => channel(parseInt(h.slice(i, i + 2), 16)))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string) {
  if (!/^#[0-9a-f]{6}$/i.test(a) || !/^#[0-9a-f]{6}$/i.test(b)) return NaN
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** Read resolved custom-property values from an element (respects theme scope). */
export function readTokens(el: Element, names: readonly string[]) {
  const cs = getComputedStyle(el)
  return Object.fromEntries(names.map((n) => [n, cs.getPropertyValue(n).trim().toLowerCase()]))
}
