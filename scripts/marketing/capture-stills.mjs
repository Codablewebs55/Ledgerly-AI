// Captures the product stills used on the marketing page from the running app
// (`pnpm dev`), at 2x density, from a fresh profile so the data is the seed.
// Usage: node scripts/marketing/capture-stills.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { APP, launch, openPage, sleep } from './cdp.mjs'

const OUT = new URL('../../public/marketing/', import.meta.url)
mkdirSync(OUT, { recursive: true })

// Finds the element whose text matches, then the nearest ancestor matching `up`.
const rectOf = (text, up) => `(() => {
  const el = [...document.querySelectorAll('body *')].find((n) => n.childElementCount === 0 && n.textContent.trim() === ${JSON.stringify(text)})
  const box = el?.closest(${JSON.stringify(up)})
  if (!box) throw new Error('not found: ' + ${JSON.stringify(text)})
  const r = box.getBoundingClientRect()
  return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height }
})()`

async function shoot(page, file, clip, beyond = true) {
  const { data } = await page.send('Page.captureScreenshot', { format: 'webp', quality: 92, captureBeyondViewport: beyond, clip: { ...clip, scale: 1 } })
  writeFileSync(new URL(file, OUT), Buffer.from(data, 'base64'))
  console.log('wrote', file, Math.round(clip.width), 'x', Math.round(clip.height))
}

const { port, close } = await launch()
try {
  // Desktop overview and its parts
  const page = await openPage(port, 'about:blank')
  await page.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 2, mobile: false })
  await page.send('Page.navigate', { url: `${APP}/app` })
  await sleep(2500)
  await page.evaluate('document.fonts.ready.then(() => true)')
  // The whole Overview, top to bottom, as the hero's screen. The viewport grows to the page height first so the
  // fixed sidebar runs the full length, as it does on a tall screen.
  const fullHeight = await page.evaluate('document.documentElement.scrollHeight')
  await page.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: fullHeight, deviceScaleFactor: 2, mobile: false })
  await sleep(500)
  await shoot(page, 'overview-desktop.webp', { x: 0, y: 0, width: 1440, height: fullHeight })
  // Panel positions as fractions of the full screen, for the hero's lifted-panel layer
  console.log(await page.evaluate(`JSON.stringify([${JSON.stringify('Cash on hand')}, ${JSON.stringify('Ledgerly AI')}].map((t, i) => {
    const el = [...document.querySelectorAll('body *')].find((n) => n.childElementCount === 0 && n.textContent.trim() === t)
    const r = el.closest(i ? 'section' : '[class*="rounded"][class*="border"]').getBoundingClientRect()
    return { t, left: (r.x / 1440 * 100).toFixed(2), top: (r.y / ${fullHeight} * 100).toFixed(2), width: (r.width / 1440 * 100).toFixed(2) }
  }))`))
  await page.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 2, mobile: false })
  await sleep(500)
  await shoot(page, 'card-cash.webp', await page.evaluate(rectOf('Cash on hand', '[class*="rounded"][class*="border"]')))
  await shoot(page, 'card-ai.webp', await page.evaluate(rectOf('Ledgerly AI', 'section')))
  await shoot(page, 'row-paid.webp', await page.evaluate(rectOf('Atlas Logistics', 'tr')))
  // Section fragments for the capability and workflow sections
  const section = (id) => `(() => { const r = document.querySelector('[aria-labelledby="${id}"]').getBoundingClientRect(); return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height } })()`
  await shoot(page, 'cashflow.webp', await page.evaluate(section('cashflow-title')))
  await shoot(page, 'attention.webp', await page.evaluate(section('attention-title')))
  await shoot(page, 'recent-invoices.webp', await page.evaluate(section('recent-title')))
  await shoot(page, 'metrics.webp', await page.evaluate(rectOf('Cash on hand', 'section')))

  // Ledgerly AI panel, opened from the header
  await page.evaluate(`[...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Ask Ledgerly').click()`)
  await sleep(1800)
  await shoot(page, 'assistant-panel.webp', await page.evaluate(`(() => { const r = document.querySelector('[role="dialog"]').getBoundingClientRect(); return { x: innerWidth - r.width, y: 0, width: r.width, height: innerHeight } })()`), false)
  page.close()

  // Invoices list and a filled-in invoice, framed on the main content (no sidebar)
  const app = await openPage(port, 'about:blank')
  await app.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 2, mobile: false })
  const mainClip = `(() => { const r = document.querySelector('main').getBoundingClientRect(); return { x: r.x, y: 0, width: r.width, height: 900 } })()`
  await app.send('Page.navigate', { url: `${APP}/app/invoices` })
  await sleep(2500)
  await shoot(app, 'invoices-list.webp', await app.evaluate(mainClip))
  await app.send('Page.navigate', { url: `${APP}/app/invoices/new` })
  await sleep(2500)
  // Drive the real form through React's value setters so state updates exactly as typing would
  await app.evaluate(`(() => {
    const set = (el, v) => {
      const proto = el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v)
      el.dispatchEvent(new Event(el instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }))
    }
    const client = [...document.querySelectorAll('select')].find((s) => [...s.options].some((o) => o.textContent === 'Northwind Studio'))
    set(client, [...client.options].find((o) => o.textContent === 'Northwind Studio').value)
    set(document.querySelector('[aria-label="Line 1 description"]'), 'Brand system — phase 3')
    set(document.querySelector('[aria-label="Line 1 quantity"]'), '1')
    set(document.querySelector('[aria-label="Line 1 rate"]'), '8400')
    return true
  })()`)
  await sleep(600)
  await shoot(app, 'create-invoice.webp', await app.evaluate(mainClip))
  app.close()

  // Mobile overview
  const mobile = await openPage(port, 'about:blank')
  await mobile.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true })
  await mobile.send('Page.navigate', { url: `${APP}/app` })
  await sleep(2500)
  await mobile.evaluate('document.fonts.ready.then(() => true)')
  await shoot(mobile, 'overview-mobile.webp', { x: 0, y: 0, width: 390, height: 844 })
  mobile.close()
} finally {
  await close()
}
