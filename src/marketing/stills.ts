// Public assets resolve under the deploy base (e.g. /Ledgerly-AI/ on GitHub Pages).
const base = import.meta.env.BASE_URL

/** Product stills captured from the running app by scripts/marketing/capture-stills.mjs (2x, seed data). Sizes are CSS px. */
export const stills = {
  overview: { src: base + 'marketing/overview-desktop.webp', w: 1440, h: 1474 },
  overviewMobile: { src: base + 'marketing/overview-mobile.webp', w: 390, h: 844 },
  invoices: { src: base + 'marketing/invoices-list.webp', w: 1192, h: 900 },
  createInvoice: { src: base + 'marketing/create-invoice.webp', w: 1192, h: 900 },
  cashflow: { src: base + 'marketing/cashflow.webp', w: 747, h: 494 },
  attention: { src: base + 'marketing/attention.webp', w: 365, h: 456 },
  recent: { src: base + 'marketing/recent-invoices.webp', w: 747, h: 456 },
  metrics: { src: base + 'marketing/metrics.webp', w: 1128, h: 222 },
  cash: { src: base + 'marketing/card-cash.webp', w: 270, h: 222 },
  aiCard: { src: base + 'marketing/card-ai.webp', w: 365, h: 494 },
  aiPanel: { src: base + 'marketing/assistant-panel.webp', w: 416, h: 900 },
  paidRow: { src: base + 'marketing/row-paid.webp', w: 745, h: 57 },
  // Portrait for the featured testimonial, supplied on the Marketing canvas (Storyboard8)
  testimonialFace: { src: base + 'marketing/testimonial-portrait.jpg', w: 320, h: 320 },
} as const

export type Still = (typeof stills)[keyof typeof stills]
