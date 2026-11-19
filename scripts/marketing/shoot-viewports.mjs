// QA captures of a route at the marketing breakpoints.
// Usage: node scripts/marketing/shoot-viewports.mjs [path] [outDir] [height]
import { mkdirSync, writeFileSync } from 'node:fs'
import { APP, launch, openPage, sleep } from './cdp.mjs'

const [path = '/', outDir = './.qa', height = '1100'] = process.argv.slice(2)
const widths = (process.env.WIDTHS ?? '1440,834,390').split(',').map(Number)
mkdirSync(outDir, { recursive: true })

const { port, close } = await launch({ port: 9445 })
try {
  for (const width of widths) {
    const page = await openPage(port, 'about:blank')
    await page.send('Emulation.setDeviceMetricsOverride', { width, height: Number(height), deviceScaleFactor: 1, mobile: width < 768 })
    if (process.env.REDUCED) await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
    await page.send('Page.navigate', { url: APP + path })
    await sleep(2500)
    if (process.env.SCROLL) {
      await page.evaluate(`window.scrollTo(0, ${Number(process.env.SCROLL)})`)
      await sleep(600)
    }
    const overflow = await page.evaluate('document.documentElement.scrollWidth > innerWidth')
    const { data } = await page.send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(`${outDir}/${width}.png`, Buffer.from(data, 'base64'))
    console.log(width, overflow ? 'HORIZONTAL OVERFLOW' : 'no overflow')
    page.close()
  }
} finally {
  await close()
}
