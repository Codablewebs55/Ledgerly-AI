import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Badge, Button, Card, CardHeader } from '@/ds'
import { contrastRatio, readTokens } from '@/lib/color'
import {
  chartTokens,
  fontWeights,
  iconSizes,
  layoutTokens,
  motionDurations,
  motionEasings,
  primitiveScales,
  radiusScale,
  semanticGroups,
  shadowScale,
  spacingScale,
  statusTokens,
  typeScale,
} from '@/styles/tokens/tokens'
import { Code } from './docs'

// Design-system foundations (/design-system/foundations). Every value shown is
// read live from the token CSS, so this page cannot drift from the code.

const allTokenNames = [
  ...primitiveScales.flatMap((s) => s.steps.map((st) => st.token)),
  ...semanticGroups.flatMap((g) => g.tokens.map((t) => t.token)),
  ...statusTokens.flatMap((s) => [`--ldg-bg-${s.key}`, `--ldg-bg-${s.key}-subtle`, `--ldg-fg-${s.key}`]),
  ...chartTokens.map((c) => c.token),
  '--ldg-bg-surface-raised',
  '--ldg-fg-inverse',
  '--ldg-fg-inverse-muted',
  '--ldg-fg-inverse-accent',
  '--ldg-fg-on-warning',
  '--ldg-line-focus-inverse',
]

function useTokens(names: readonly string[]) {
  const ref = useRef<HTMLDivElement>(null)
  const [values, setValues] = useState<Record<string, string>>({})
  useLayoutEffect(() => {
    if (ref.current) setValues(readTokens(ref.current, names))
  }, [names])
  return [ref, values] as const
}

const contrastPairs: { fg: string; bg: string; min: number; label: string }[] = [
  { fg: '--ldg-fg-default', bg: '--ldg-bg-canvas', min: 4.5, label: 'Body on canvas' },
  { fg: '--ldg-fg-muted', bg: '--ldg-bg-surface', min: 4.5, label: 'Secondary on surface' },
  { fg: '--ldg-fg-subtle', bg: '--ldg-bg-surface-sunken', min: 4.5, label: 'Helper on sunken' },
  { fg: '--ldg-fg-brand', bg: '--ldg-bg-canvas', min: 4.5, label: 'Link on canvas' },
  { fg: '--ldg-fg-on-brand', bg: '--ldg-bg-brand', min: 4.5, label: 'Primary button' },
  { fg: '--ldg-fg-on-accent', bg: '--ldg-bg-accent', min: 4.5, label: 'Accent button' },
  { fg: '--ldg-fg-inverse-accent', bg: '--ldg-bg-inverse', min: 4.5, label: 'Lime on inverse' },
  { fg: '--ldg-fg-accent', bg: '--ldg-bg-surface', min: 4.5, label: 'Lime text on light' },
  { fg: '--ldg-fg-positive', bg: '--ldg-bg-positive-subtle', min: 4.5, label: 'Paid badge' },
  { fg: '--ldg-fg-negative', bg: '--ldg-bg-negative-subtle', min: 4.5, label: 'Overdue badge' },
  { fg: '--ldg-fg-warning', bg: '--ldg-bg-warning-subtle', min: 4.5, label: 'Due-soon badge' },
  { fg: '--ldg-line-input', bg: '--ldg-bg-surface', min: 3, label: 'Input border' },
]

export default function FoundationsPage() {
  const [rootRef, tokens] = useTokens(allTokenNames)
  const hex = (t: string) => tokens[t] ?? ''

  return (
    <div ref={rootRef} className="min-h-screen bg-canvas text-fg">
      <Hero />

      <main className="mx-auto flex max-w-(--ldg-content-max) flex-col gap-14 px-(--ldg-page-gutter) py-12 md:py-16">
        <Section
          id="palette"
          title="Brand palette"
          intro="Primitive tokens. Raw values with no meaning attached. Components never use these directly; they exist to feed the semantic layer."
        >
          <div className="flex flex-col gap-8">
            {primitiveScales.map((scale) => (
              <div key={scale.family}>
                <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-heading-sm">{scale.name}</h3>
                  <span className="text-caption text-fg-subtle">{scale.role}</span>
                  <Code>--ldg-{scale.family}-*</Code>
                </div>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-[repeat(13,minmax(0,1fr))]">
                  {scale.steps.map((s) => (
                    <div key={s.token} className="min-w-0">
                      <div
                        className="h-14 rounded-md border border-line-subtle"
                        style={{ background: `var(${s.token})` }}
                      />
                      <div className="mt-1.5 flex items-center gap-1 text-caption">
                        <span className="font-medium text-fg">{s.step}</span>
                        {s.step === scale.anchor && <span className="size-1.5 rounded-full bg-brand" title="Anchor step" />}
                      </div>
                      <div className="figure truncate text-caption text-fg-subtle">{hex(s.token)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="semantic"
          title="Semantic colour"
          intro="What components consume. Each token describes a job, not a hue, so re-theming means re-pointing these and never editing a component."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {semanticGroups.map((group) => (
              <Card key={group.name}>
                <CardHeader title={group.name} />
                <ul className="divide-y divide-line-subtle">
                  {group.tokens.map((t) => (
                    <li key={t.token} className="flex items-center gap-3 py-2">
                      <SemanticSample kind={group.kind} token={t.token} />
                      <div className="min-w-0 flex-1">
                        <Code>{t.utility}</Code>
                        <p className="mt-0.5 truncate text-caption text-fg-subtle">{t.purpose}</p>
                      </div>
                      <span className="figure shrink-0 text-caption text-fg-muted">{hex(t.token)}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
            <Card>
              <CardHeader title="Status" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {statusTokens.map((s) => (
                  <div key={s.key} className="flex flex-col gap-2">
                    <Badge tone={s.key} dot>
                      {s.example}
                    </Badge>
                    <span className="text-caption text-fg-subtle">{s.name}</span>
                    <Code>text-fg-{s.key}</Code>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <CardHeader title="Data visualisation" />
              <div className="flex h-24 items-end gap-2">
                {chartTokens.map((c, i) => (
                  <div
                    key={c.token}
                    className="flex-1 rounded-t-xs"
                    style={{ background: `var(${c.token})`, height: `${[92, 70, 56, 44, 34, 26, 80, 62, 18, 50, 40][i]}%` }}
                    title={c.utility}
                  />
                ))}
              </div>
              <p className="mt-3 text-caption text-fg-subtle">
                Series 1–6 are each ≥3:1 on surface. Highlight and highlight-strong (the outline of a month still in progress) are decorative: always paired with a legend label, a tooltip and the sr-only data table. Grid, positive and negative support the series.
              </p>
            </Card>
          </div>
        </Section>

        <Section
          id="contrast"
          title="Contrast"
          intro="WCAG 2.2 AA. Text needs 4.5:1 and UI boundaries need 3:1. Ratios below are computed live. `pnpm tokens:check` audits all 156 light and dark pairings and fails the build on any regression."
        >
          <Card>
            <ul className="grid gap-x-8 sm:grid-cols-2">
              {contrastPairs.map((p) => {
                const ratio = contrastRatio(hex(p.fg), hex(p.bg))
                const pass = ratio >= p.min
                return (
                  <li key={p.label} className="flex min-w-0 items-center gap-2 border-b border-line-subtle py-3 sm:gap-3">
                    <span
                      className="grid h-9 w-12 shrink-0 place-items-center rounded-sm border border-line-subtle text-label font-semibold"
                      style={{ background: `var(${p.bg})`, color: `var(${p.fg})` }}
                    >
                      Aa
                    </span>
                    <span className="min-w-0 flex-1 truncate text-body-sm">{p.label}</span>
                    <span className="figure text-body-sm font-medium">{Number.isNaN(ratio) ? '—' : `${ratio.toFixed(2)}:1`}</span>
                    <Badge size="sm" tone={pass ? 'positive' : 'negative'}>
                      {pass ? 'AA' : 'Fail'}
                    </Badge>
                  </li>
                )
              })}
            </ul>
          </Card>
        </Section>

        <Section id="lime" title="Using lime" intro="Lime is the spark, not the paint. It marks the one thing that matters most in a view.">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader title="Do" />
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 rounded-lg bg-inverse p-4">
                  <span className="text-body-sm text-fg-inverse-muted">Net cash this month</span>
                  <span className="figure ml-auto text-figure-lg text-fg-inverse-accent">+$18,420</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex w-max flex-col items-start gap-1">
                    <Button variant="accent" size="sm">Start free trial</Button>
                    <span className="text-caption text-fg-subtle">One accent CTA per view</span>
                  </div>
                </div>
                <p className="text-body-sm text-fg-muted">
                  Highlights on dark surfaces, the single key action, AI insights (on <Code>bg-accent-subtle</Code>), and chart emphasis.
                </p>
              </div>
            </Card>
            <Card>
              <CardHeader title="Don't" />
              <div className="flex flex-col gap-4">
                <div className="rounded-lg bg-accent p-4 text-body-sm text-fg-on-accent">Full lime panels and page backgrounds</div>
                <p className="text-body-sm text-fg-muted">
                  Never set lime text on light surfaces (it fails contrast). Use <Code>text-fg-accent</Code> (lime-800) instead. Never use
                  lime for status: positive amounts are forest.
                </p>
              </div>
            </Card>
          </div>
        </Section>

        <Section
          id="type"
          title="Typography"
          intro="Manrope for headings and display, Inter for interface and body. Each step bundles size, line-height, tracking and weight into one utility."
        >
          <Card>
            <ul className="divide-y divide-line-subtle">
              {typeScale.map((t) => (
                <li key={t.utility} className="grid gap-2 py-3 md:grid-cols-[15rem_1fr] md:items-baseline md:gap-6">
                  <div className="flex flex-col gap-0.5">
                    <Code>{t.utility}</Code>
                    <span className="figure text-caption text-fg-subtle">
                      {t.family === 'display' ? 'Manrope' : 'Inter'} · {t.px}/{t.lineHeight} · {t.weight}
                      {t.tracking !== '0' && ` · ${t.tracking}`}
                    </span>
                    <span className="text-caption text-fg-subtle">{t.use}</span>
                  </div>
                  <p
                    className={`${t.utility} ${t.family === 'display' ? 'font-display' : 'font-sans'} ${t.figure ? 'figure' : ''} min-w-0 break-words`}
                  >
                    {t.sample}
                  </p>
                </li>
              ))}
            </ul>
          </Card>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="Tabular figures" />
              <div className="grid grid-cols-2 gap-6">
                {[false, true].map((tabular) => (
                  <div key={String(tabular)}>
                    <p className="mb-2 rounded-sm border border-line-subtle p-2 text-caption text-fg-subtle">{tabular ? 'Figure (tabular)' : 'Proportional'}</p>
                    <ul className={`flex flex-col items-end gap-1 text-figure-md ${tabular ? 'figure' : ''}`}>
                      {['$1,111.11', '$48,000.00', '$7,909.18', '$111,101.00'].map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-caption text-fg-subtle">
                Add <Code>figure</Code> to every amount, count, percentage and date column so digits align.
              </p>
            </Card>
            <Card>
              <CardHeader title="Weights" />
              <ul className="flex flex-col gap-2.5">
                {fontWeights.map((w) => (
                  <li key={w.value} className="flex items-baseline gap-3">
                    <span className={`font-display text-heading-md ${w.utility} w-28 shrink-0`}>{w.name}</span>
                    <span className="figure text-caption text-fg-subtle">{w.value}</span>
                    <span className="ml-auto text-right text-caption text-fg-muted">{w.use}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Section>

        <Section id="spacing" title="Spacing" intro="A 4px grid. Tailwind's p-, m-, gap- and w- steps all derive from one --spacing token.">
          <Card>
            <ul className="grid gap-x-10 gap-y-2 lg:grid-cols-2">
              {spacingScale.map((s) => (
                <li key={s.step} className="grid h-max grid-cols-[3.5rem_3rem_1fr] items-center gap-3 md:grid-cols-[4rem_3.5rem_1fr_9rem]">
                  <Code>{s.step}</Code>
                  <span className="figure text-caption text-fg-subtle">{s.px}px</span>
                  <span className="h-3 rounded-xs bg-brand" style={{ width: `${s.px}px` }} />
                  <span className="hidden text-caption text-fg-muted md:block">{s.use}</span>
                </li>
              ))}
            </ul>
          </Card>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="Layout tokens" description="Widths and rhythm shared by the app shell and the marketing site" />
              <ul className="flex flex-col divide-y divide-line-subtle">
                {layoutTokens.map((t) => (
                  <li key={t.token} className="flex flex-col gap-0.5 py-2.5 first:pt-0 last:pb-0">
                    <Code>{t.utility}</Code>
                    <span className="text-caption text-fg-muted">{t.use}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <CardHeader title="Icon sizes" description="Lucide icons on the 4px grid; colour comes from the text token" />
              <ul className="flex flex-col divide-y divide-line-subtle">
                {iconSizes.map((s) => (
                  <li key={s.utility} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span className="grid size-6 shrink-0 place-items-center text-fg-icon">
                      <span className={`${s.utility} rounded-xs bg-current`} aria-hidden />
                    </span>
                    <Code>{s.utility}</Code>
                    <span className="figure text-caption text-fg-subtle">{s.px}px</span>
                    <span className="ml-auto text-right text-caption text-fg-muted">{s.use}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Section>

        <Section id="shape" title="Radius & elevation" intro="Softly rounded controls, calm warm-tinted shadows. Elevation signals layering, never decoration.">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="Radius" />
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
                {radiusScale.map((r) => (
                  <div key={r.utility} className="flex flex-col gap-1.5">
                    <div className={`aspect-square w-full max-w-20 border-2 border-line-brand bg-brand-subtle ${r.utility}`} />
                    <Code>{r.utility.replace('rounded-', '')}</Code>
                    <span className="text-caption text-fg-subtle">{r.px === 9999 ? 'full' : `${r.px}px`} · {r.use}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <CardHeader title="Shadow" />
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-canvas p-4 sm:grid-cols-3">
                {shadowScale.map((s) => (
                  <div key={s.utility} className={`flex h-24 flex-col justify-end rounded-lg bg-surface p-3 ${s.utility}`}>
                    <Code>{s.utility}</Code>
                    <span className="mt-1 text-caption text-fg-subtle">{s.use}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Section>

        <Section
          id="motion"
          title="Motion"
          intro="Quick and quiet. Hover a row to preview it. All durations collapse to 0 under prefers-reduced-motion."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="Duration" />
              <ul className="flex flex-col gap-1">
                {motionDurations.map((d) => (
                  <li key={d.token} className="group flex items-center gap-3 rounded-md px-2 py-2 hover:bg-surface-hover">
                    <span className="figure w-12 text-caption font-medium">{d.ms}ms</span>
                    <span className="relative h-2 flex-1 rounded-full bg-surface-sunken">
                      <span
                        className="absolute top-1/2 left-0 size-3 -translate-y-1/2 rounded-full bg-brand ease-standard group-hover:left-[calc(100%-0.75rem)]"
                        style={{ transitionProperty: 'left', transitionDuration: `var(${d.token})` }}
                      />
                    </span>
                    <span className="w-36 text-right text-caption text-fg-muted">{d.use}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <CardHeader title="Easing" />
              <ul className="flex flex-col gap-1">
                {motionEasings.map((e) => (
                  <li key={e.utility} className="group flex items-center gap-3 rounded-md px-2 py-2 hover:bg-surface-hover">
                    <Code>{e.utility}</Code>
                    <span className="relative h-2 flex-1 rounded-full bg-surface-sunken">
                      <span
                        className={`absolute top-1/2 left-0 size-3 -translate-y-1/2 rounded-full bg-accent ring-2 ring-brand group-hover:left-[calc(100%-0.75rem)] ${e.utility}`}
                        style={{ transitionProperty: 'left', transitionDuration: 'var(--duration-slower)' }}
                      />
                    </span>
                    <span className="hidden w-32 text-right text-caption text-fg-muted sm:block">{e.use}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Section>

        <Section
          id="dark"
          title="Dark theme (prepared)"
          intro='Every semantic token has a dark value. It is off in the product and switches on only under data-theme="dark", as in this preview.'
        >
          <DarkPreview />
        </Section>
      </main>

      <footer className="border-t border-line px-(--ldg-page-gutter) py-8 text-center text-caption text-fg-subtle">
        Ledgerly design tokens · primitives → semantic → theme
      </footer>
    </div>
  )
}

function Hero() {
  return (
    <header className="bg-inverse text-fg-inverse">
      <div className="mx-auto max-w-(--ldg-content-max) px-(--ldg-page-gutter) pt-8 pb-14 md:pt-10 md:pb-16">
        <div className="flex items-center justify-between gap-4">
          <span className="text-label text-fg-inverse-muted">Foundations</span>
          <span className="rounded-full border border-line-inverse px-3 py-1 text-caption text-fg-inverse-muted">v0.2</span>
        </div>
        <h1 className="mt-14 max-w-4xl text-display-lg md:mt-16 md:text-display-xl xl:text-display-2xl">
          Your business is complicated enough. <span className="text-fg-inverse-accent">Your accounting shouldn't be.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-body-lg text-fg-inverse-muted">
          Deep forest for trust, soft lime for the moments that matter, warm neutrals for calm. Sophisticated, trustworthy, approachable.
        </p>
        <dl className="mt-10 grid max-w-3xl grid-cols-2 gap-6 border-t border-line-inverse pt-6 md:grid-cols-4">
          {[
            ['Primary', 'Forest 700'],
            ['Accent', 'Lime 300'],
            ['Headings', 'Manrope'],
            ['Interface', 'Inter'],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-caption text-fg-inverse-muted">{k}</dt>
              <dd className="mt-1 font-display text-heading-sm">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  )
}

function DarkPreview() {
  return (
    <div data-theme="dark" className="rounded-xl bg-canvas p-4 text-fg md:p-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-line bg-surface p-5 md:col-span-2">
          <p className="text-label text-fg-muted">Cash balance</p>
          <p className="figure mt-1 text-figure-xl">$184,250.00</p>
          <p className="mt-1 text-caption text-fg-positive">+8.2% vs last month</p>
          <div className="mt-5 flex h-20 items-end gap-1.5">
            {[40, 55, 48, 62, 58, 70, 66, 78, 74, 88, 82, 96].map((h, i) => (
              <span key={i} className={`flex-1 rounded-t-xs ${i === 11 ? 'bg-chart-highlight' : 'bg-chart-1'}`} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-5">
          <p className="text-heading-sm font-display">Invoices</p>
          {(
            [
              ['positive', 'Paid'],
              ['warning', 'Due soon'],
              ['negative', 'Overdue'],
              ['info', 'Sent'],
            ] as const
          ).map(([k, label]) => (
            <Badge key={k} tone={k} dot>
              {label}
            </Badge>
          ))}
          <div className="mt-auto flex gap-2 pt-2">
            <Button size="sm">Primary</Button>
            <Button size="sm" variant="accent">
              Accent
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ id, title, intro, children }: { id: string; title: string; intro: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-8">
      <div className="mb-6 max-w-2xl">
        <h2 id={`${id}-title`} className="text-heading-xl">
          {title}
        </h2>
        <p className="mt-2 text-body-md text-fg-muted">{intro}</p>
      </div>
      {children}
    </section>
  )
}



function SemanticSample({ kind, token }: { kind: 'fill' | 'text' | 'line'; token: string }) {
  if (kind === 'text')
    return (
      <span className="grid size-9 shrink-0 place-items-center rounded-md border border-line-subtle bg-surface font-display text-heading-sm" style={{ color: `var(${token})`, background: token.includes('on-brand') ? 'var(--ldg-bg-brand)' : token.includes('on-accent') ? 'var(--ldg-bg-accent)' : undefined }}>
        Aa
      </span>
    )
  if (kind === 'line') return <span className="size-9 shrink-0 rounded-md border-2 bg-surface" style={{ borderColor: `var(${token})` }} />
  return <span className="size-9 shrink-0 rounded-md border border-line-subtle" style={{ background: `var(${token})` }} />
}
