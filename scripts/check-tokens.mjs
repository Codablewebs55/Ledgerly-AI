#!/usr/bin/env node
// Ledgerly token contrast audit (WCAG 2.2 AA).
//
// Reads the real token files — primitives.css + semantic.css — resolves every
// var() chain for the light theme and the prepared dark theme, then checks
// each foreground/background pairing the product actually uses.
//   4.5:1  normal text (1.4.3)
//   3:1    large text, UI component boundaries, focus rings, graphics (1.4.11)
// Exits non-zero on any failure so it can gate CI.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = join(dirname(fileURLToPath(import.meta.url)), '../src/styles/tokens')
const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '')
const primitivesCss = strip(readFileSync(join(dir, 'primitives.css'), 'utf8'))
const semanticCss = strip(readFileSync(join(dir, 'semantic.css'), 'utf8'))

function decls(block) {
  const out = {}
  for (const m of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2].trim()
  return out
}
// First top-level `:root {…}` (skips the responsive @media copies) and the dark block.
const rootBlock = (css) => css.match(/^:root\s*\{([\s\S]*?)\n\}/m)[1]
const primitives = decls(rootBlock(primitivesCss))
const light = { ...primitives, ...decls(rootBlock(semanticCss)) }
const dark = { ...light, ...decls(semanticCss.match(/\[data-theme="dark"\]\s*\{([\s\S]*?)\n\}/)[1]) }

function resolve(vars, name, depth = 0) {
  const v = vars[name]
  if (v == null) throw new Error(`Unknown token ${name}`)
  const ref = v.match(/^var\((--[\w-]+)\)$/)
  if (ref && depth < 10) return resolve(vars, ref[1], depth + 1)
  return v
}
function rgb(hex) {
  const h = hex.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
}
function luminance(hex) {
  const [r, g, b] = rgb(hex).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
export function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

const TEXT = 4.5
const UI = 3
// [foreground, [backgrounds…], min, why]
// chart-highlight and chart-highlight-strong are decorative emphasis (always paired with a legend label, a
// tooltip and an sr-only data table), so they are deliberately not held to 3:1 here.
const pairs = [
  ['fg-default', ['bg-canvas', 'bg-surface', 'bg-surface-sunken', 'bg-surface-hover', 'bg-surface-selected', 'bg-brand-subtle', 'bg-accent-subtle'], TEXT, 'body text'],
  ['fg-muted', ['bg-canvas', 'bg-surface', 'bg-surface-sunken', 'bg-surface-hover', 'bg-surface-selected'], TEXT, 'secondary text'],
  ['fg-subtle', ['bg-canvas', 'bg-surface', 'bg-surface-sunken', 'bg-surface-hover'], TEXT, 'helper text'],
  ['fg-default', ['bg-accent-muted'], TEXT, 'insight band title'],
  ['fg-muted', ['bg-accent-muted'], TEXT, 'insight band description'],
  ['fg-icon', ['bg-surface', 'bg-surface-sunken', 'bg-brand-subtle'], UI, 'decorative icons'],
  ['fg-brand', ['bg-canvas', 'bg-surface', 'bg-surface-sunken', 'bg-brand-subtle', 'bg-surface-selected'], TEXT, 'links, brand text'],
  ['fg-brand-strong', ['bg-canvas', 'bg-surface'], TEXT, 'link hover'],
  ['fg-accent', ['bg-canvas', 'bg-surface', 'bg-accent-subtle'], TEXT, 'lime text'],
  ['fg-on-brand', ['bg-brand', 'bg-brand-hover', 'bg-brand-active', 'bg-positive', 'bg-negative', 'bg-info'], TEXT, 'text on solid fills'],
  ['fg-on-accent', ['bg-accent', 'bg-accent-hover'], TEXT, 'text on lime'],
  ['fg-on-warning', ['bg-warning'], TEXT, 'text on amber'],
  ['fg-inverse', ['bg-inverse', 'bg-inverse-raised'], TEXT, 'text on dark bands'],
  ['fg-inverse-muted', ['bg-inverse', 'bg-inverse-raised'], TEXT, 'secondary on dark'],
  ['fg-inverse-accent', ['bg-inverse', 'bg-inverse-raised'], TEXT, 'lime highlight on dark'],
  ['fg-positive', ['bg-positive-subtle', 'bg-surface', 'bg-canvas'], TEXT, 'positive badge/figure'],
  ['fg-negative', ['bg-negative-subtle', 'bg-surface', 'bg-canvas'], TEXT, 'negative badge/figure'],
  ['fg-warning', ['bg-warning-subtle', 'bg-surface', 'bg-canvas'], TEXT, 'warning badge'],
  ['fg-info', ['bg-info-subtle', 'bg-surface', 'bg-canvas'], TEXT, 'info badge'],
  ['fg-draft', ['bg-draft-subtle', 'bg-surface', 'bg-canvas'], TEXT, 'draft badge'],
  ['bg-draft', ['bg-draft-subtle'], UI, 'draft badge dot'],
  ['line-input', ['bg-surface', 'bg-canvas'], UI, 'form control boundary'],
  ['line-brand', ['bg-surface', 'bg-canvas'], UI, 'checked control'],
  ['line-focus', ['bg-canvas', 'bg-surface', 'bg-surface-sunken', 'bg-brand-subtle'], UI, 'focus ring'],
  ['line-focus-inverse', ['bg-inverse', 'bg-inverse-raised', 'bg-brand'], UI, 'focus ring on dark/brand'],
  ['line-invalid', ['bg-surface', 'bg-canvas'], UI, 'invalid form control boundary'],
  ['line-inverse-accent', ['bg-inverse', 'bg-inverse-raised', 'bg-brand'], UI, 'lime outline on dark/brand'],
  ['fg-on-accent-muted', ['bg-accent'], TEXT, 'secondary text on lime'],
  ['bg-brand', ['bg-canvas', 'bg-surface'], UI, 'primary button boundary'],
  ['chart-1', ['bg-surface', 'bg-canvas'], UI, 'chart series'],
  ['chart-2', ['bg-surface', 'bg-canvas'], UI, 'chart series'],
  ['chart-3', ['bg-surface', 'bg-canvas'], UI, 'chart series'],
  ['chart-4', ['bg-surface', 'bg-canvas'], UI, 'chart series'],
  ['chart-5', ['bg-surface', 'bg-canvas'], UI, 'chart series'],
  ['chart-6', ['bg-surface', 'bg-canvas'], UI, 'chart series'],
]

let failures = 0
const json = process.argv.includes('--json')
const report = {}
for (const [theme, vars] of [['light', light], ['dark', dark]]) {
  report[theme] = []
  for (const [fg, bgs, min, why] of pairs) {
    for (const bg of bgs) {
      const ratio = contrast(resolve(vars, `--ldg-${fg}`), resolve(vars, `--ldg-${bg}`))
      const ok = ratio >= min
      if (!ok) failures++
      report[theme].push({ fg, bg, ratio: +ratio.toFixed(2), min, ok, why })
    }
  }
}

if (json) console.log(JSON.stringify(report, null, 2))
else {
  for (const [theme, rows] of Object.entries(report)) {
    const bad = rows.filter((r) => !r.ok)
    console.log(`\n${theme}: ${rows.length - bad.length}/${rows.length} pairs pass`)
    for (const r of bad) console.log(`  FAIL ${r.fg} on ${r.bg}: ${r.ratio} < ${r.min} (${r.why})`)
    const tightest = [...rows].filter((r) => r.ok).sort((a, b) => a.ratio / a.min - b.ratio / b.min).slice(0, 4)
    for (const r of tightest) console.log(`  tight ${r.fg} on ${r.bg}: ${r.ratio} (min ${r.min})`)
  }
}
process.exit(failures ? 1 : 0)
