// Typed catalogue of Ledgerly tokens for documentation and tooling.
//
// Values are NOT duplicated here — CSS (primitives.css / semantic.css /
// theme.css) is the single source of truth. Docs resolve live values with
// getComputedStyle, so this file only carries names, utilities and intent.

export type ScaleStep = { step: string; token: string }

const steps = (family: string, list: (string | number)[]): ScaleStep[] =>
  list.map((s) => ({ step: String(s), token: `--ldg-${family}-${s}` }))

const full = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

export const primitiveScales = [
  { name: 'Forest', role: 'Primary brand', family: 'forest', steps: steps('forest', full), anchor: '700' },
  { name: 'Lime', role: 'Accent — use sparingly', family: 'lime', steps: steps('lime', full), anchor: '300' },
  { name: 'Sand', role: 'Warm neutrals', family: 'sand', steps: steps('sand', [0, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]), anchor: '50' },
  { name: 'Red', role: 'Negative', family: 'red', steps: steps('red', [50, 100, 300, 400, 500, 600, 700, 900]), anchor: '600' },
  { name: 'Amber', role: 'Warning', family: 'amber', steps: steps('amber', [50, 100, 300, 400, 500, 600, 700, 900]), anchor: '400' },
  { name: 'Blue', role: 'Info', family: 'blue', steps: steps('blue', [50, 100, 300, 400, 500, 600, 700, 900]), anchor: '600' },
] as const

export type SemanticToken = { token: string; utility: string; purpose: string }
export type SemanticGroup = { name: string; kind: 'fill' | 'text' | 'line'; tokens: SemanticToken[] }

export const semanticGroups: SemanticGroup[] = [
  {
    name: 'Surfaces',
    kind: 'fill',
    tokens: [
      { token: '--ldg-bg-canvas', utility: 'bg-canvas', purpose: 'Page background — warm off-white' },
      { token: '--ldg-bg-surface', utility: 'bg-surface', purpose: 'Cards, tables, inputs' },
      { token: '--ldg-bg-surface-sunken', utility: 'bg-surface-sunken', purpose: 'Wells, table headers, tracks' },
      { token: '--ldg-bg-surface-hover', utility: 'bg-surface-hover', purpose: 'Row and item hover' },
      { token: '--ldg-bg-surface-selected', utility: 'bg-surface-selected', purpose: 'Selected row, active nav' },
      { token: '--ldg-bg-inverse', utility: 'bg-inverse', purpose: 'Dark brand bands, sidebar' },
      { token: '--ldg-bg-inverse-raised', utility: 'bg-inverse-raised', purpose: 'Cards on inverse' },
      { token: '--ldg-bg-inverse-sunken', utility: 'bg-inverse-sunken', purpose: 'Recessed bands on inverse' },
      { token: '--ldg-bg-inverse-chip', utility: 'bg-inverse-chip', purpose: 'Pills on inverse' },
      { token: '--ldg-bg-surface-raised', utility: 'bg-surface-raised', purpose: 'Popovers, menus, dialogs (with shadow)' },
      { token: '--ldg-bg-overlay', utility: 'bg-overlay', purpose: 'Modal scrim (48% sand-950)' },
    ],
  },
  {
    name: 'Brand & accent',
    kind: 'fill',
    tokens: [
      { token: '--ldg-bg-brand', utility: 'bg-brand', purpose: 'Primary actions' },
      { token: '--ldg-bg-brand-hover', utility: 'bg-brand-hover', purpose: 'Primary hover' },
      { token: '--ldg-bg-brand-active', utility: 'bg-brand-active', purpose: 'Primary pressed' },
      { token: '--ldg-bg-brand-subtle', utility: 'bg-brand-subtle', purpose: 'Tinted brand areas' },
      { token: '--ldg-bg-brand-subtle-hover', utility: 'bg-brand-subtle-hover', purpose: 'Hover on tinted brand areas' },
      { token: '--ldg-bg-accent', utility: 'bg-accent', purpose: 'Key CTA, highlights — sparingly' },
      { token: '--ldg-bg-accent-hover', utility: 'bg-accent-hover', purpose: 'Accent hover' },
      { token: '--ldg-bg-accent-subtle', utility: 'bg-accent-subtle', purpose: 'AI / insight tint' },
      { token: '--ldg-bg-accent-muted', utility: 'bg-accent-muted', purpose: 'Insight card header band' },
    ],
  },
  {
    name: 'Foreground',
    kind: 'text',
    tokens: [
      { token: '--ldg-fg-default', utility: 'text-fg', purpose: 'Body, headings, figures' },
      { token: '--ldg-fg-muted', utility: 'text-fg-muted', purpose: 'Secondary text, labels' },
      { token: '--ldg-fg-subtle', utility: 'text-fg-subtle', purpose: 'Captions, helper, placeholder' },
      { token: '--ldg-fg-icon', utility: 'text-fg-icon', purpose: 'Decorative icons (metric card, tiles)' },
      { token: '--ldg-fg-disabled', utility: 'text-fg-disabled', purpose: 'Disabled (AA-exempt)' },
      { token: '--ldg-fg-brand', utility: 'text-fg-brand', purpose: 'Links, brand text' },
      { token: '--ldg-fg-brand-strong', utility: 'text-fg-brand-strong', purpose: 'Link hover' },
      { token: '--ldg-fg-accent', utility: 'text-fg-accent', purpose: 'Lime-family text on light' },
      { token: '--ldg-fg-on-brand', utility: 'text-fg-on-brand', purpose: 'Text on brand fills' },
      { token: '--ldg-fg-inverse', utility: 'text-fg-inverse', purpose: 'Text on forest (inverse) surfaces' },
      { token: '--ldg-fg-inverse-muted', utility: 'text-fg-inverse-muted', purpose: 'Secondary text on inverse' },
      { token: '--ldg-fg-inverse-subtle', utility: 'text-fg-inverse-subtle', purpose: 'Section labels on the forest rail' },
      { token: '--ldg-fg-inverse-accent', utility: 'text-fg-inverse-accent', purpose: 'Lime highlight text on inverse' },
      { token: '--ldg-fg-on-accent', utility: 'text-fg-on-accent', purpose: 'Text on lime' },
      { token: '--ldg-fg-on-accent-muted', utility: 'text-fg-on-accent-muted', purpose: 'Secondary text on lime (footer links)' },
      { token: '--ldg-fg-on-warning', utility: 'text-fg-on-warning', purpose: 'Text on solid amber' },
    ],
  },
  {
    name: 'Lines',
    kind: 'line',
    tokens: [
      { token: '--ldg-line-subtle', utility: 'border-line-subtle', purpose: 'Row dividers' },
      { token: '--ldg-line-default', utility: 'border-line', purpose: 'Card borders' },
      { token: '--ldg-line-strong', utility: 'border-line-strong', purpose: 'Emphasised dividers' },
      { token: '--ldg-line-control', utility: 'border-line-control', purpose: 'Secondary / outline buttons' },
      { token: '--ldg-line-input', utility: 'border-line-input', purpose: 'Checkbox, switch, radio boundaries (≥3:1)' },
      { token: '--ldg-line-input-hover', utility: 'border-line-input-hover', purpose: 'Those controls on hover' },
      { token: '--ldg-line-field', utility: 'border-line-field', purpose: 'Empty text field, select, textarea' },
      { token: '--ldg-line-field-filled', utility: 'border-line-field-filled', purpose: 'Field holding a value' },
      { token: '--ldg-line-field-hover', utility: 'border-line-field-hover', purpose: 'Field on hover' },
      { token: '--ldg-line-invalid', utility: 'border-line-invalid', purpose: 'Invalid field (≥3:1)' },
      { token: '--ldg-line-focus', utility: 'outline-line-focus', purpose: 'Focus ring' },
      { token: '--ldg-line-focus-inverse', utility: 'outline-line-focus-inverse', purpose: 'Focus ring on inverse / brand' },
      { token: '--ldg-line-brand', utility: 'border-line-brand', purpose: 'Checked, selected, emphasis card' },
      { token: '--ldg-line-inverse', utility: 'border-line-inverse', purpose: 'Borders and dividers on inverse' },
      { token: '--ldg-line-inverse-accent', utility: 'border-line-inverse-accent', purpose: 'Lime outline on inverse / brand' },
      { token: '--ldg-line-accent', utility: 'divide-line-accent', purpose: 'Dividers inside insight (lime) cards' },
      { token: '--ldg-line-on-accent', utility: 'border-line-on-accent', purpose: 'Dividers on a lime surface' },
    ],
  },
]

export const statusTokens = [
  { name: 'Positive', key: 'positive', example: 'Paid' },
  { name: 'Negative', key: 'negative', example: 'Overdue' },
  { name: 'Warning', key: 'warning', example: 'Due soon' },
  { name: 'Draft', key: 'draft', example: 'Draft' },
  { name: 'Info', key: 'info', example: 'Sent' },
] as const

export const chartTokens = ['1', '2', '3', '4', '5', '6', 'highlight', 'highlight-strong', 'grid', 'positive', 'negative'].map((k) => ({
  token: `--ldg-chart-${k}`,
  utility: `fill-chart-${k}`,
}))

export type TypeStep = {
  utility: string
  family: 'display' | 'sans'
  px: number
  lineHeight: string
  weight: number
  tracking: string
  use: string
  sample: string
  figure?: boolean
}

export const typeScale: TypeStep[] = [
  { utility: 'text-display-2xl', family: 'display', px: 64, lineHeight: '1.05', weight: 700, tracking: '-3.5%', use: 'Marketing hero', sample: 'Accounting, simplified.' },
  { utility: 'text-display-xl', family: 'display', px: 48, lineHeight: '1.1', weight: 700, tracking: '-3%', use: 'Hero (tablet), section titles', sample: 'Know where you stand' },
  { utility: 'text-display-lg', family: 'display', px: 36, lineHeight: '1.15', weight: 700, tracking: '-2.5%', use: 'Hero (mobile), marketing H2', sample: 'Close the month in minutes' },
  { utility: 'text-heading-xl', family: 'display', px: 28, lineHeight: '1.25', weight: 700, tracking: '-2%', use: 'App page title', sample: 'Invoices' },
  { utility: 'text-heading-lg', family: 'display', px: 22, lineHeight: '1.3', weight: 700, tracking: '-1.5%', use: 'Mobile page title, dialogs', sample: 'Create invoice' },
  { utility: 'text-heading-md', family: 'display', px: 18, lineHeight: '1.4', weight: 600, tracking: '-1%', use: 'Panel headings', sample: 'Cash flow' },
  { utility: 'text-heading-sm', family: 'display', px: 15, lineHeight: '1.45', weight: 600, tracking: '-0.5%', use: 'Card titles', sample: 'Outstanding receivables' },
  { utility: 'text-body-lg', family: 'sans', px: 18, lineHeight: '1.6', weight: 400, tracking: '0', use: 'Marketing lead copy', sample: 'Invoices, expenses and reconciliation in one calm place.' },
  { utility: 'text-body-md', family: 'sans', px: 15, lineHeight: '1.6', weight: 400, tracking: '0', use: 'Default body', sample: 'Your bank feed matched 42 transactions automatically.' },
  { utility: 'text-body-sm', family: 'sans', px: 14, lineHeight: '1.45', weight: 400, tracking: '0', use: 'Tables, inputs, nav', sample: 'Northwind Studio · Net 30' },
  { utility: 'text-label', family: 'sans', px: 13, lineHeight: '1.35', weight: 500, tracking: '0', use: 'Labels, badges, tabs', sample: 'Due date' },
  { utility: 'text-caption', family: 'sans', px: 12, lineHeight: '1.35', weight: 400, tracking: '0', use: 'Helper, timestamps, axes', sample: 'Updated 2 minutes ago' },
  { utility: 'text-micro', family: 'sans', px: 10, lineHeight: '1', weight: 600, tracking: '0', use: 'Initials in the sm avatar only', sample: 'NS' },
  { utility: 'text-figure-xl', family: 'sans', px: 32, lineHeight: '1.15', weight: 600, tracking: '-2.5%', use: 'Hero KPI', sample: '$184,250.00', figure: true },
  { utility: 'text-figure-lg', family: 'sans', px: 24, lineHeight: '1.2', weight: 600, tracking: '-2%', use: 'Metric cards, totals', sample: '$12,480.50', figure: true },
  { utility: 'text-figure-md', family: 'sans', px: 15, lineHeight: '1.45', weight: 500, tracking: '0', use: 'Table amounts', sample: '$1,104.00', figure: true },
]

/** Non-colour layout tokens (semantic.css). Values step up at md / xl where noted. */
export const layoutTokens = [
  { token: '--ldg-content-max', utility: 'max-w-(--ldg-content-max)', use: 'App and marketing content width (1280px)' },
  { token: '--ldg-prose-max', utility: 'max-w-(--ldg-prose-max)', use: 'Reading measure for lead paragraphs (544px)' },
  { token: '--ldg-page-gutter', utility: 'px-(--ldg-page-gutter)', use: 'Page side padding: 16 → 24 → 32px' },
  { token: '--ldg-section-gap', utility: 'gap-(--ldg-section-gap)', use: 'Between stacked app sections: 24 → 32px' },
  { token: '--ldg-marketing-section-y', utility: 'py-(--ldg-marketing-section-y)', use: 'Marketing section padding: 64 → 96 → 128px' },
  { token: '--ldg-marketing-nav-height', utility: 'h-(--ldg-marketing-nav-height)', use: 'Marketing header: 64 → 72px' },
  { token: '--ldg-topbar-height', utility: 'h-(--ldg-topbar-height)', use: 'App top bar (64px)' },
  { token: '--ldg-sidebar-width', utility: 'w-(--ldg-sidebar-width)', use: 'Expanded side nav (248px)' },
  { token: '--ldg-sidebar-rail-width', utility: 'w-(--ldg-sidebar-rail-width)', use: 'Collapsed icon rail (72px)' },
  { token: '--ldg-sheet-width', utility: 'w-(--ldg-sheet-width)', use: 'Side panels, e.g. the AI assistant (416px)' },
]

/** Icon sizes on the 4px grid. Icons inherit colour (currentColor). */
export const iconSizes = [
  { utility: 'size-3', px: 12, use: 'Sort arrows in table headers' },
  { utility: 'size-3.5', px: 14, use: 'Inside badges, small buttons, menus' },
  { utility: 'size-4', px: 16, use: 'Default UI icon: inputs, nav, card headers' },
  { utility: 'size-4.5', px: 18, use: 'Large buttons, dialog close, side nav' },
  { utility: 'size-5', px: 20, use: 'Feature tiles, mobile header actions' },
]

export const fontWeights = [
  { name: 'Regular', utility: 'font-regular', value: 400, use: 'Body (Inter)' },
  { name: 'Medium', utility: 'font-medium', value: 500, use: 'Labels, table amounts' },
  { name: 'Semibold', utility: 'font-semibold', value: 600, use: 'Headings sm/md, figures' },
  { name: 'Bold', utility: 'font-bold', value: 700, use: 'Display & page titles (Manrope)' },
  { name: 'Extrabold', utility: 'font-extrabold', value: 800, use: 'Wordmark only' },
]

export const spacingScale = [0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32].map((step) => ({
  step,
  px: step * 4,
  use:
    ({ 1: 'icon–label gap', 2: 'tight control padding', 3: 'control padding', 4: 'card gap', 6: 'card padding', 8: 'section gap', 16: 'marketing section', 24: 'hero spacing' } as Record<number, string>)[step] ?? '',
}))

export const radiusScale = [
  { utility: 'rounded-xs', px: 4, use: 'Badges, checkboxes' },
  { utility: 'rounded-sm', px: 6, use: 'Small buttons, tags' },
  { utility: 'rounded-md', px: 8, use: 'Buttons, inputs, menus' },
  { utility: 'rounded-lg', px: 12, use: 'Cards, tables' },
  { utility: 'rounded-xl', px: 16, use: 'Panels, dialogs, marketing cards' },
  { utility: 'rounded-2xl', px: 24, use: 'Marketing feature cards, product frames' },
  { utility: 'rounded-full', px: 9999, use: 'Pills, avatars' },
]

export const shadowScale = [
  { utility: 'shadow-xs', use: 'Subtle lift (unused by controls)' },
  { utility: 'shadow-sm', use: 'Switch thumbs' },
  { utility: 'shadow-md', use: 'Sticky bars' },
  { utility: 'shadow-lg', use: 'Menus, popovers' },
  { utility: 'shadow-xl', use: 'Dialogs, drawers' },
  { utility: 'shadow-pressed', use: 'Landing section pressed in under the pointer' },
]

export const motionDurations = [
  { token: '--duration-instant', ms: 80, use: 'Press feedback' },
  { token: '--duration-fast', ms: 140, use: 'Hover, colour, focus' },
  { token: '--duration-base', ms: 200, use: 'Toggles, small reveals' },
  { token: '--duration-slow', ms: 320, use: 'Drawers, dialogs' },
  { token: '--duration-slower', ms: 480, use: 'Charts drawing in' },
]

export const motionEasings = [
  { utility: 'ease-standard', curve: 'cubic-bezier(0.2, 0, 0, 1)', use: 'Most state changes' },
  { utility: 'ease-enter', curve: 'cubic-bezier(0.16, 1, 0.3, 1)', use: 'Menus, toasts arriving' },
  { utility: 'ease-exit', curve: 'cubic-bezier(0.4, 0, 1, 1)', use: 'Elements leaving' },
]
