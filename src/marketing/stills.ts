/** Product stills captured from the running app by scripts/marketing/capture-stills.mjs (2x, seed data). Sizes are CSS px. */
export const stills = {
  overview: { src: '/marketing/overview-desktop.webp', w: 1440, h: 1474 },
  overviewMobile: { src: '/marketing/overview-mobile.webp', w: 390, h: 844 },
  invoices: { src: '/marketing/invoices-list.webp', w: 1192, h: 900 },
  createInvoice: { src: '/marketing/create-invoice.webp', w: 1192, h: 900 },
  cashflow: { src: '/marketing/cashflow.webp', w: 747, h: 494 },
  attention: { src: '/marketing/attention.webp', w: 365, h: 456 },
  recent: { src: '/marketing/recent-invoices.webp', w: 747, h: 456 },
  metrics: { src: '/marketing/metrics.webp', w: 1128, h: 222 },
  cash: { src: '/marketing/card-cash.webp', w: 270, h: 222 },
  aiCard: { src: '/marketing/card-ai.webp', w: 365, h: 494 },
  aiPanel: { src: '/marketing/assistant-panel.webp', w: 416, h: 900 },
  paidRow: { src: '/marketing/row-paid.webp', w: 745, h: 57 },
  // Portrait for the featured testimonial, supplied on the Marketing canvas (Storyboard8)
  testimonialFace: { src: '/marketing/testimonial-portrait.jpg', w: 320, h: 320 },
} as const

export type Still = (typeof stills)[keyof typeof stills]
