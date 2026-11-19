// Minimal Chrome DevTools Protocol driver for the marketing asset scripts.
// Launches the locally installed Chrome headless with a fresh profile (so the
// app boots from its seed data, not someone's localStorage) and exposes
// send() plus a few page helpers. No dependencies: Node's fetch + WebSocket.
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
export const APP = process.env.APP_URL ?? 'http://localhost:52436'

export async function launch({ port = 9444 } = {}) {
  const profile = mkdtempSync(join(tmpdir(), 'ledgerly-cdp-'))
  const proc = spawn(CHROME, ['--headless=new', '--hide-scrollbars', '--mute-audio', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' })
  for (let i = 0; i < 40; i++) {
    try {
      await fetch(`http://127.0.0.1:${port}/json/version`)
      break
    } catch {
      await sleep(250)
    }
  }
  // Chrome keeps writing to the profile for a moment after the kill, so wait for exit
  const close = async () => {
    const exited = new Promise((r) => proc.once('exit', r))
    proc.kill()
    await exited
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
  }
  return { port, close }
}

export async function openPage(port, url) {
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?${url}`, { method: 'PUT' })).json()
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  let id = 0
  const pending = new Map()
  const listeners = new Map()
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data)
    if (d.id && pending.has(d.id)) {
      const { resolve, reject } = pending.get(d.id)
      pending.delete(d.id)
      if (d.error) reject(new Error(d.error.message))
      else resolve(d.result)
    } else if (d.method) listeners.get(d.method)?.forEach((fn) => fn(d.params))
  }
  await new Promise((r) => (ws.onopen = r))
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      pending.set(++id, { resolve, reject })
      ws.send(JSON.stringify({ id, method, params }))
    })
  const on = (method, fn) => listeners.set(method, [...(listeners.get(method) ?? []), fn])
  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? 'evaluate failed')
    return r.result.value
  }
  return { send, on, evaluate, close: () => ws.close() }
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
