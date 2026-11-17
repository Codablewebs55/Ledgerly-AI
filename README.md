# Ledgerly

Premium accounting for freelancers, small businesses, agencies and growing companies.

> Your business is complicated enough. Your accounting shouldn't be.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS v4 · React Router · Tempo canvas (`tempo-sdk`)

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Start the app |
| `pnpm build` | Token contrast audit → typecheck → production build |
| `pnpm typecheck` | TypeScript only |
| `pnpm tokens:check` | WCAG 2.2 AA audit of every semantic colour pairing (light + dark) |
| `pnpm lint` | oxlint |

## Structure

```
src/
  styles/tokens/   primitives.css → semantic.css → theme.css (Tailwind utilities), tokens.ts (docs catalogue)
  ds/              shared design-system components
  showcase/        design-system documentation pages (/design-system)
  lib/             utilities
scripts/           tooling (token contrast audit)
tempo/             Tempo canvas host and canvases — not app code
```

Components consume semantic tokens only. Tailwind's default palette is disabled, so
`bg-brand`, `text-fg-muted`, `border-line` exist and `bg-green-600` does not.
