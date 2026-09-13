# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Bootstrap-based SEG3525 course site at `gb2g.github.io` with a software engineering portfolio built on Vite + React + TypeScript, led by the Psaltikon Library project.

**Architecture:** A single scrolling page — no router, because GitHub Pages cannot rewrite deep links. All content lives in three typed data modules under `src/data/`; no component contains a project name, date, or URL. Theming is CSS custom properties on `data-theme`, applied by a blocking inline script before first paint. GitHub Actions builds and publishes; a separate workflow checks outbound links on a schedule without gating deploys.

**Tech Stack:** Vite 7, React 19, TypeScript 5.9 (strict), Vitest 5 + Testing Library (jsdom), `@fontsource-variable` for self-hosted type, `tsx` for the link-check script.

**Spec:** `docs/superpowers/specs/2026-09-13-portfolio-redesign-design.md`

## Global Constraints

- **Branch:** all work happens on `redesign`, branched from `main`. `main` currently serves the live site; do not commit to it until the branch is reviewed and merged.
- **No router.** No `react-router-dom`, no `history` API navigation. Section links are plain `#anchor` hrefs.
- **No component may contain literal content.** Project names, years, URLs, bio copy, and skill lists come from `src/data/`. A component containing the string `Psaltikon` is a bug.
- **TypeScript strict.** `strict: true`, `noUncheckedIndexedAccess: true`. No `any`, no non-null assertions (`!`).
- **Every external link** renders with `target="_blank"` and `rel="noopener noreferrer"`.
- **Exact versions:** react `19.2.3`, react-dom `19.2.3`, vite `^7.2.4`, `@vitejs/plugin-react` `^5.1.1`, typescript `~5.9.3`, vitest `^5.0.0`, jsdom `^30.0.1`, `@testing-library/react` `^16.3.3`, `@testing-library/dom` `^10.4.1`, `@testing-library/jest-dom` `^7.0.1`, `tsx` `^4.23.13`, `@fontsource-variable/{newsreader,inter,jetbrains-mono}` `^5.3.0`.
- **Contrast floor:** every foreground/background token pair ≥ 4.5:1 in both themes. Enforced by test, not by eye.
- **Vite `base`** is `'/'`. This is a GitHub *user* site served from the domain root, not a project subpath.
- **Copy rule:** the site never describes Kevin as a designer, and never uses the phrase "UI/UX" about him. He is a software engineering student.
- **Attribution rule:** Psaltikon Library is "an organisation project, principal developer". Precision Cycle Co., St. Elias Bookstore, FreshAlert and PC Builders are labelled team projects. Never imply sole authorship of a team project.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json` | Toolchain |
| `index.html` | Shell + pre-paint theme script |
| `src/main.tsx` | Mount |
| `src/App.tsx` | Page composition, landmarks, skip link |
| `src/types.ts` | `Project`, `ProjectLink`, `SkillGroup`, `Profile`, `Theme` |
| `src/data/projects.ts` | All 11 projects |
| `src/data/profile.ts` | Name, bio, education, availability, contact, socials |
| `src/data/skills.ts` | Three stack-strip groups |
| `src/hooks/useTheme.ts` | `resolveTheme` (pure) + `useTheme` hook |
| `src/hooks/useScrollSpy.ts` | Active section id |
| `src/components/*.tsx` | Nav, ThemeToggle, Hero, StackStrip, SectionHead, ProjectRow, ProjectList, About, Contact, Footer |
| `src/styles/tokens.css` | Colour, type and spacing tokens, light + dark |
| `src/styles/global.css` | Reset, base elements, layout primitives, a11y |
| `scripts/check-links.ts` | Outbound link checker |
| `.github/workflows/deploy.yml` | Build + publish to Pages |
| `.github/workflows/links.yml` | Link check on PR + weekly |

---

### Task 1: Branch and toolchain

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`, `src/test/setup.ts`, `index.html`
- Test: `src/App.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: a working `npm test` / `npm run typecheck` / `npm run build` cycle. `App` is a zero-prop default-exported component.

> Note on `index.html`: the repo already has one (the old Bootstrap site). This task **overwrites** it. The old markup remains in git history and the other legacy files are deleted in Task 11.

- [ ] **Step 1: Create the branch**

```bash
git checkout -b redesign
```

- [ ] **Step 2: Write `package.json`**

```json
{
  "name": "gb2g-portfolio",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "check-links": "tsx scripts/check-links.ts"
  },
  "dependencies": {
    "@fontsource-variable/inter": "^5.3.0",
    "@fontsource-variable/jetbrains-mono": "^5.3.0",
    "@fontsource-variable/newsreader": "^5.3.0",
    "react": "19.2.3",
    "react-dom": "19.2.3"
  },
  "devDependencies": {
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^7.0.1",
    "@testing-library/react": "^16.3.3",
    "@types/node": "^22.0.0",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "jsdom": "^30.0.1",
    "tsx": "^4.23.13",
    "typescript": "~5.9.3",
    "vite": "^7.2.4",
    "vitest": "^5.0.0"
  }
}
```

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vitest/globals"]
  },
  "include": ["src", "scripts"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: Write `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noEmit": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Write `vite.config.ts`**

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
```

- [ ] **Step 6: Write `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 7: Write `src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 8: Write `index.html`** (overwrites the legacy Bootstrap page)

```html
<!doctype html>
<html lang="en" data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Kevin El-Saikali — Software Engineer</title>
    <meta
      name="description"
      content="Kevin El-Saikali — fourth-year software engineering student at the University of Ottawa. React, TypeScript and Supabase applications."
    />
    <link rel="canonical" href="https://gb2g.github.io/" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 9: Write `src/App.tsx`**

```tsx
export default function App() {
  return <h1>Kevin El-Saikali</h1>
}
```

- [ ] **Step 10: Write `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root not found')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 11: Write the failing test `src/App.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the name as a heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Kevin El-Saikali' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 12: Install and run the test**

```bash
npm install
npm test
```

Expected: 1 test passes. (The implementation was written alongside the scaffold here because a test cannot run at all until the toolchain exists — this is the one task where test-first is not possible. Every later task is strictly test-first.)

- [ ] **Step 13: Verify typecheck and build**

```bash
npm run typecheck && npm run build
```

Expected: both exit 0, and `dist/index.html` exists.

- [ ] **Step 14: Add `dist` and `node_modules` to `.gitignore`**

Append to the existing `.gitignore` (which already contains `.superpowers/`):

```
node_modules/
dist/
```

- [ ] **Step 15: Commit**

```bash
git add package.json package-lock.json tsconfig.json tsconfig.node.json vite.config.ts index.html .gitignore src/
git commit -m "chore: scaffold Vite + React + TypeScript toolchain"
```

---

### Task 2: Design tokens with enforced contrast

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `src/styles/contrast.test.ts`
- Test: `src/styles/contrast.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: CSS custom properties `--paper`, `--ink`, `--muted`, `--rule`, `--accent`, `--paper-raised`, plus `--font-serif`, `--font-sans`, `--font-mono` and the spacing scale. Available under `:root` (light) and `[data-theme='dark']`.

- [ ] **Step 1: Write the failing test `src/styles/contrast.test.ts`**

```ts
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// __dirname does not exist in ESM — resolve relative to this module's URL.
const css = readFileSync(fileURLToPath(new URL('./tokens.css', import.meta.url)), 'utf8')

function block(selector: string): Record<string, string> {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`).exec(css)
  if (!match || match[1] === undefined) throw new Error(`Block not found: ${selector}`)
  const out: Record<string, string> = {}
  for (const line of match[1].split(';')) {
    const [rawName, rawValue] = line.split(':')
    if (!rawName || !rawValue) continue
    out[rawName.trim()] = rawValue.trim()
  }
  return out
}

function srgbToLinear(channel: number): number {
  const c = channel / 255
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function luminance(hex: string): number {
  const clean = hex.replace('#', '')
  const r = Number.parseInt(clean.slice(0, 2), 16)
  const g = Number.parseInt(clean.slice(2, 4), 16)
  const b = Number.parseInt(clean.slice(4, 6), 16)
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
}

function contrast(a: string, b: string): number {
  const l1 = luminance(a)
  const l2 = luminance(b)
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

describe.each([
  ['light', ':root'],
  ['dark', "[data-theme='dark']"],
])('%s theme contrast', (_name, selector) => {
  const tokens = block(selector)

  it.each(['--ink', '--muted', '--accent'])('%s on --paper meets AA', (fg) => {
    const foreground = tokens[fg]
    const background = tokens['--paper']
    expect(foreground, `${fg} missing`).toBeDefined()
    expect(background, '--paper missing').toBeDefined()
    expect(contrast(foreground as string, background as string)).toBeGreaterThanOrEqual(4.5)
  })

  // The skip link paints --paper on --accent. White text here fails in dark mode
  // (3.17:1), which is exactly the kind of regression this test exists to catch.
  it('--paper on --accent meets AA', () => {
    const paper = tokens['--paper']
    const accent = tokens['--accent']
    expect(paper, '--paper missing').toBeDefined()
    expect(accent, '--accent missing').toBeDefined()
    expect(contrast(paper as string, accent as string)).toBeGreaterThanOrEqual(4.5)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test -- contrast
```

Expected: FAIL — `Cannot find module` / `ENOENT` for `tokens.css`.

- [ ] **Step 3: Write `src/styles/tokens.css`**

```css
:root {
  --paper: #faf9f7;
  --paper-raised: #ffffff;
  --ink: #17171a;
  --muted: #5e5b55;
  --rule: #e4e0d8;
  --accent: #a63f1c;

  --font-serif: 'Newsreader Variable', Georgia, 'Times New Roman', serif;
  --font-sans: 'Inter Variable', ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono Variable', ui-monospace, 'SF Mono', Menlo, monospace;

  --step-1: 0.5rem;
  --step-2: 1rem;
  --step-3: 1.5rem;
  --step-4: 2.5rem;
  --step-5: 4rem;
  --measure: 62ch;
  --gutter: clamp(1.25rem, 5vw, 2.5rem);
  --page-max: 68rem;
}

[data-theme='dark'] {
  --paper: #101012;
  --paper-raised: #17171a;
  --ink: #e8e6e1;
  --muted: #a29d94;
  --rule: #26262a;
  --accent: #e0714a;
}
```

> `--muted` and `--accent` are darkened from the mockup values (`#6b6862` / `#b4451f`) specifically to clear 4.5:1 against `#faf9f7`. Do not restore the lighter values — the test will reject them.

- [ ] **Step 4: Run the test to verify it passes**

```bash
npm test -- contrast
```

Expected: PASS, 8 assertions (3 token pairs + the skip-link pair, × 2 themes).

- [ ] **Step 5: Write `src/styles/global.css`**

```css
@import '@fontsource-variable/newsreader';
@import '@fontsource-variable/inter';
@import '@fontsource-variable/jetbrains-mono';
@import './tokens.css';

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-sans);
  font-size: 1rem;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}

h1,
h2,
h3 {
  font-family: var(--font-serif);
  font-weight: 400;
  letter-spacing: -0.025em;
  line-height: 1.05;
  margin: 0;
}

a {
  color: inherit;
}

.page {
  max-width: var(--page-max);
  margin-inline: auto;
  padding-inline: var(--gutter);
}

.mono {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.skip-link {
  position: absolute;
  left: var(--step-2);
  top: -4rem;
  z-index: 100;
  padding: var(--step-1) var(--step-2);
  background: var(--accent);
  color: var(--paper);
  border-radius: 4px;
  text-decoration: none;
  transition: top 120ms ease;
}

.skip-link:focus {
  top: var(--step-2);
}

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 6: Import the stylesheet from `src/main.tsx`**

Add as the first import in `src/main.tsx`:

```tsx
import './styles/global.css'
```

- [ ] **Step 7: Verify the build still passes**

```bash
npm run build
```

Expected: exit 0. Fonts resolve from `node_modules`; no network fetch at build or runtime.

- [ ] **Step 8: Commit**

```bash
git add src/styles src/main.tsx
git commit -m "feat: add design tokens with contrast enforced by test"
```

---

### Task 3: Types and data

**Files:**
- Create: `src/types.ts`, `src/data/projects.ts`, `src/data/profile.ts`, `src/data/skills.ts`
- Test: `src/data/projects.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type ProjectLink = { label: string; href: string }`
  - `type Project = { id, title, year, category, summary, stack, links, note?, featured? }`
  - `type SkillGroup = { label: string; items: string[] }`
  - `type Profile` — see Step 5
  - `projects: readonly Project[]`, `profile: Profile`, `skillGroups: readonly SkillGroup[]`

- [ ] **Step 1: Write the failing test `src/data/projects.test.ts`**

```ts
import { projects } from './projects'
import { profile } from './profile'
import { skillGroups } from './skills'

describe('project data', () => {
  it('has unique ids', () => {
    const ids = projects.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every project either links or a note, never neither', () => {
    for (const p of projects) {
      const hasLinks = p.links.length > 0
      const hasNote = typeof p.note === 'string' && p.note.length > 0
      expect(hasLinks || hasNote, `${p.id} has neither links nor a note`).toBe(true)
    }
  })

  it('uses absolute https urls for every link', () => {
    for (const p of projects) {
      for (const link of p.links) {
        expect(link.href, `${p.id} → ${link.label}`).toMatch(/^https:\/\//)
      }
    }
  })

  it('leads with Psaltikon Library among featured projects', () => {
    const featured = projects.filter((p) => p.featured)
    expect(featured.length).toBe(5)
    expect(featured[0]?.title).toBe('Psaltikon Library')
  })

  it('never describes Kevin as a designer', () => {
    const corpus = [profile.bio, profile.headlineLead, ...projects.map((p) => p.summary)]
      .join(' ')
      .toLowerCase()
    expect(corpus).not.toContain('ui/ux')
    expect(corpus).not.toContain('designer')
  })

  it('publishes no phone number or street address', () => {
    const serialised = JSON.stringify(profile)
    expect(serialised).not.toMatch(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/)
    expect(serialised.toLowerCase()).not.toContain('laurier')
  })

  it('lists SQL and Supabase in the stack strip', () => {
    const all = skillGroups.flatMap((g) => g.items)
    expect(all).toContain('SQL')
    expect(all).toContain('Supabase')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test -- projects
```

Expected: FAIL — cannot resolve `./projects`.

- [ ] **Step 3: Write `src/types.ts`**

```ts
export type ProjectLink = {
  label: string
  href: string
}

export type ProjectCategory = 'client' | 'personal' | 'course'

export type Project = {
  id: string
  title: string
  year: number
  category: ProjectCategory
  summary: string
  stack: readonly string[]
  links: readonly ProjectLink[]
  note?: string
  featured?: boolean
}

export type SkillGroup = {
  label: string
  items: readonly string[]
}

export type Social = {
  label: string
  href: string
}

export type Profile = {
  name: string
  headlineLead: string
  headlineAccent: string
  eyebrow: string
  bio: string
  currently: string
  availability: string
  location: string
  email: string
  socials: readonly Social[]
}

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'
```

- [ ] **Step 4: Write `src/data/projects.ts`**

```ts
import type { Project } from '../types'

export const projects: readonly Project[] = [
  {
    id: 'psaltikon-library',
    title: 'Psaltikon Library',
    year: 2026,
    category: 'client',
    featured: true,
    summary:
      'A digital library of Orthodox Byzantine chant, built under the psaltikon-library organisation where I am the principal developer. Nine routed pages including an admin dashboard, backed by Supabase Postgres with per-user row-level security; twelve migrations covering saved chants, booklets, a submissions pipeline with a Postgres email trigger, and security-definer stats views. Renders chant PDFs and generates booklets client-side.',
    stack: ['React 19', 'TypeScript', 'Supabase', 'PostgreSQL', 'Tailwind v4', 'pdf-lib'],
    links: [
      { label: 'Live', href: 'https://psaltikon-library.github.io/psaltikon-library/' },
      { label: 'Source', href: 'https://github.com/psaltikon-library/psaltikon-library' },
    ],
  },
  {
    id: 'pitch-partners',
    title: 'Pitch Partners',
    year: 2026,
    category: 'client',
    featured: true,
    summary:
      'Marketing and booking site for a professional football coaching business, live on the client’s own domain. Multi-page React app with animated route transitions and a serverless booking endpoint that delivers enquiries by email.',
    stack: ['React', 'Vite', 'Framer Motion', 'Serverless', 'Vercel'],
    links: [
      { label: 'Live', href: 'https://pitchpartners.ca' },
      { label: 'Source', href: 'https://github.com/GB2G/pitch-partners' },
    ],
  },
  {
    id: 'vanna-noun',
    title: 'Vanna Noun — Renoun Creation',
    year: 2026,
    category: 'client',
    featured: true,
    summary:
      'Portfolio and booking platform for a director of photography. A calendar date picker feeds server-side API routes that dispatch transactional email through Resend, alongside a filterable media gallery.',
    stack: ['Next.js App Router', 'TypeScript', 'Tailwind v4', 'Resend'],
    links: [{ label: 'Source', href: 'https://github.com/GB2G/vanna-website' }],
  },
  {
    id: 'inkbyos',
    title: 'InkbyOs',
    year: 2026,
    category: 'client',
    featured: true,
    summary:
      'Dark, minimalist site for a private tattoo studio, built on a hand-rolled CSS token system with a scroll-driven line motif. Deep links survive refresh through host-level rewrites.',
    stack: ['React 18', 'TypeScript', 'Vite', 'Vercel'],
    links: [
      { label: 'Live', href: 'https://inkbyos-website.vercel.app' },
      { label: 'Source', href: 'https://github.com/GB2G/inkbyos-website' },
    ],
  },
  {
    id: 'blackjack',
    title: 'Blackjack',
    year: 2026,
    category: 'personal',
    featured: true,
    summary:
      'A complete blackjack engine in TypeScript — shoe management, splits, double-downs and dealer rules — wrapped in an animated table interface.',
    stack: ['React 19', 'TypeScript', 'Tailwind v4', 'Framer Motion'],
    links: [{ label: 'Source', href: 'https://github.com/GB2G/blackjack-game' }],
  },
  {
    id: 'royalstats',
    title: 'RoyalStats',
    year: 2025,
    category: 'course',
    summary: 'A statistics dashboard exploring data presentation and chart interaction patterns.',
    stack: ['JavaScript', 'HTML', 'CSS'],
    links: [
      { label: 'Live', href: 'https://gb2g.github.io/RoyalStats/' },
      { label: 'Source', href: 'https://github.com/GB2G/RoyalStats' },
    ],
  },
  {
    id: 'match-mania',
    title: 'Match Mania',
    year: 2025,
    category: 'course',
    summary:
      'A memory card game with difficulty tiers, move scoring and a timed mode, written without a framework.',
    stack: ['JavaScript', 'HTML', 'CSS'],
    links: [
      { label: 'Live', href: 'https://gb2g.github.io/memory-game/' },
      { label: 'Source', href: 'https://github.com/GB2G/memory-game' },
    ],
  },
  {
    id: 'precision-cycle',
    title: 'Precision Cycle Co.',
    year: 2025,
    category: 'course',
    summary:
      'Team project — a bike repair shop site covering service booking and pricing, built for a university interface design course.',
    stack: ['JavaScript', 'Bootstrap', 'HTML', 'CSS'],
    links: [{ label: 'Live', href: 'https://gabrielzohrob.github.io/Precision-Cycle-Co./' }],
  },
  {
    id: 'st-elias-bookstore',
    title: 'St. Elias Bookstore',
    year: 2025,
    category: 'course',
    summary:
      'Team project — an e-commerce storefront with catalogue browsing, cart state and a checkout flow.',
    stack: ['JavaScript', 'Bootstrap', 'HTML', 'CSS'],
    links: [{ label: 'Live', href: 'https://gabrielzohrob.github.io/SEG3525Dev4/' }],
  },
  {
    id: 'freshalert',
    title: 'FreshAlert',
    year: 2025,
    category: 'course',
    summary:
      'Team project — a product site for a food freshness tracking concept, covering the landing experience and feature walkthrough.',
    stack: ['JavaScript', 'HTML', 'CSS'],
    links: [],
    note: 'Private team repo',
  },
  {
    id: 'pc-builders',
    title: 'PC Builders',
    year: 2025,
    category: 'course',
    summary:
      'Team project for SEG2505 — an Android application for specifying and costing desktop computer builds, written in Java against a shared backend.',
    stack: ['Java', 'Android'],
    links: [],
    note: 'Private course repo',
  },
]
```

- [ ] **Step 5: Write `src/data/profile.ts`**

```ts
import type { Profile } from '../types'

export const profile: Profile = {
  name: 'Kevin El-Saikali',
  eyebrow: 'Software Engineer · Ottawa, ON',
  headlineLead: 'I build things',
  headlineAccent: 'for the web',
  bio: 'I am a fourth-year software engineering student at the University of Ottawa. Most of what I build is full stack — React and TypeScript on the front, Postgres and serverless functions behind it — and most of it ships to people who actually use it. My largest project, Psaltikon Library, is a live chant library with authentication, row-level security and an admin dashboard that I have been developing since early 2026.',
  currently: 'BASc Software Engineering, University of Ottawa',
  availability: 'New-grad software engineering roles, 2027',
  location: 'Ottawa, ON',
  email: 'kelsa068@uottawa.ca',
  socials: [
    { label: 'GitHub', href: 'https://github.com/GB2G' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/kevin-el-saikali-8b403a28a/' },
  ],
}
```

- [ ] **Step 6: Write `src/data/skills.ts`**

```ts
import type { SkillGroup } from '../types'

export const skillGroups: readonly SkillGroup[] = [
  {
    label: 'Languages',
    items: ['TypeScript', 'JavaScript', 'Java', 'Python', 'Kotlin', 'SQL'],
  },
  {
    label: 'Frameworks',
    items: ['React 19', 'Next.js', 'Vite', 'Tailwind', 'Framer Motion'],
  },
  {
    label: 'Platform',
    items: ['Supabase', 'PostgreSQL', 'Vercel', 'GitHub Actions', 'Node', 'Android'],
  },
]
```

- [ ] **Step 7: Run the test to verify it passes**

```bash
npm test -- projects
```

Expected: PASS, 7 tests.

- [ ] **Step 8: Commit**

```bash
git add src/types.ts src/data
git commit -m "feat: add typed project, profile and skills data"
```

---

### Task 4: Theme resolution and the pre-paint script

**Files:**
- Create: `src/hooks/useTheme.ts`
- Modify: `index.html` (add the blocking script)
- Test: `src/hooks/useTheme.test.ts`

**Interfaces:**
- Consumes: `Theme`, `ResolvedTheme` from `src/types.ts`.
- Produces:
  - `resolveTheme(stored: Theme, prefersDark: boolean): ResolvedTheme`
  - `readStoredTheme(): Theme` — returns `'system'` when storage is unavailable or holds garbage
  - `useTheme(): { theme: Theme; resolved: ResolvedTheme; cycle: () => void }` where `cycle` advances light → dark → system → light

- [ ] **Step 1: Write the failing test `src/hooks/useTheme.test.ts`**

```ts
import { act, renderHook } from '@testing-library/react'
import { readStoredTheme, resolveTheme, useTheme, THEME_STORAGE_KEY } from './useTheme'

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  )
}

beforeEach(() => {
  localStorage.clear()
  stubMatchMedia(false)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('resolveTheme', () => {
  it('returns the explicit choice regardless of system preference', () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })

  it('follows the system preference when set to system', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
  })
})

describe('readStoredTheme', () => {
  it('defaults to system when nothing is stored', () => {
    expect(readStoredTheme()).toBe('system')
  })

  it('defaults to system when the stored value is not a valid theme', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'chartreuse')
    expect(readStoredTheme()).toBe('system')
  })

  it('returns system instead of throwing when storage is unavailable', () => {
    vi.stubGlobal('localStorage', {
      getItem() {
        throw new Error('SecurityError')
      },
      setItem() {
        throw new Error('SecurityError')
      },
    })
    expect(readStoredTheme()).toBe('system')
  })
})

describe('useTheme', () => {
  it('cycles light to dark to system and writes data-theme', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light')
    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('light')
    expect(document.documentElement.dataset['theme']).toBe('light')

    act(() => result.current.cycle())
    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.dataset['theme']).toBe('dark')

    act(() => result.current.cycle())
    expect(result.current.theme).toBe('system')
    expect(result.current.resolved).toBe('light')

    act(() => result.current.cycle())
    expect(result.current.theme).toBe('light')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test -- useTheme
```

Expected: FAIL — cannot resolve `./useTheme`.

- [ ] **Step 3: Write `src/hooks/useTheme.ts`**

```ts
import { useCallback, useEffect, useState } from 'react'
import type { ResolvedTheme, Theme } from '../types'

export const THEME_STORAGE_KEY = 'portfolio-theme'

const ORDER: readonly Theme[] = ['light', 'dark', 'system']

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system'
}

export function resolveTheme(stored: Theme, prefersDark: boolean): ResolvedTheme {
  if (stored === 'system') return prefersDark ? 'dark' : 'light'
  return stored
}

export function readStoredTheme(): Theme {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(raw) ? raw : 'system'
  } catch {
    return 'system'
  }
}

function writeStoredTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Storage unavailable — the in-memory choice still applies for this page view.
  }
}

function prefersDark(): boolean {
  try {
    return matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

export function useTheme(): { theme: Theme; resolved: ResolvedTheme; cycle: () => void } {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme())
  const [systemDark, setSystemDark] = useState<boolean>(() => prefersDark())

  useEffect(() => {
    const query = matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const resolved = resolveTheme(theme, systemDark)

  useEffect(() => {
    document.documentElement.dataset['theme'] = resolved
  }, [resolved])

  const cycle = useCallback(() => {
    setTheme((current) => {
      const index = ORDER.indexOf(current)
      const next = ORDER[(index + 1) % ORDER.length] ?? 'light'
      writeStoredTheme(next)
      return next
    })
  }, [])

  return { theme, resolved, cycle }
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npm test -- useTheme
```

Expected: PASS, 6 tests.

- [ ] **Step 5: Add the pre-paint script to `index.html`**

Insert immediately before `</head>`. It must stay inline and synchronous — moving it into the bundle reintroduces the white flash.

```html
    <script>
      (function () {
        try {
          var stored = localStorage.getItem('portfolio-theme');
          var valid = stored === 'light' || stored === 'dark' || stored === 'system';
          var choice = valid ? stored : 'system';
          var dark =
            choice === 'dark' ||
            (choice === 'system' &&
              window.matchMedia('(prefers-color-scheme: dark)').matches);
          document.documentElement.dataset.theme = dark ? 'dark' : 'light';
        } catch (e) {
          document.documentElement.dataset.theme = 'light';
        }
      })();
    </script>
```

- [ ] **Step 6: Verify the build passes**

```bash
npm run build
```

Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useTheme.ts src/hooks/useTheme.test.ts index.html
git commit -m "feat: add tri-state theme with pre-paint application"
```

---

### Task 5: ThemeToggle and Nav

**Files:**
- Create: `src/components/ThemeToggle.tsx`, `src/components/Nav.tsx`, `src/hooks/useScrollSpy.ts`
- Test: `src/components/ThemeToggle.test.tsx`, `src/components/Nav.test.tsx`

**Interfaces:**
- Consumes: `useTheme` from Task 4, `profile` from Task 3.
- Produces:
  - `<ThemeToggle />` — zero props
  - `<Nav />` — zero props
  - `useScrollSpy(ids: readonly string[]): string | null`
  - `SECTIONS: readonly { id: string; label: string }[]` exported from `Nav.tsx`

- [ ] **Step 1: Write the failing test `src/components/ThemeToggle.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ThemeToggle from './ThemeToggle'

beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  )
})

afterEach(() => vi.unstubAllGlobals())

describe('ThemeToggle', () => {
  it('is a button with an accessible label', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button', { name: /theme/i })).toBeInTheDocument()
  })

  it('reports pressed state when an explicit dark theme is active', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: /theme/i })

    expect(button).toHaveAttribute('aria-pressed', 'false')

    await user.click(button)
    await user.click(button)

    expect(button).toHaveAttribute('aria-pressed', 'true')
  })
})
```

- [ ] **Step 2: Install `@testing-library/user-event` and run the test**

```bash
npm install -D @testing-library/user-event@^14.6.1
npm test -- ThemeToggle
```

Expected: FAIL — cannot resolve `./ThemeToggle`.

- [ ] **Step 3: Write `src/components/ThemeToggle.tsx`**

```tsx
import { useTheme } from '../hooks/useTheme'

const GLYPH = { light: '☀', dark: '☾', system: '◐' } as const

export default function ThemeToggle() {
  const { theme, resolved, cycle } = useTheme()

  return (
    <button
      type="button"
      className="mono theme-toggle"
      onClick={cycle}
      aria-pressed={resolved === 'dark'}
      aria-label={`Theme: ${theme}. Activate to change.`}
    >
      <span aria-hidden="true">{GLYPH[theme]}</span>
      <span className="theme-toggle__label">{theme}</span>
    </button>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npm test -- ThemeToggle
```

Expected: PASS, 2 tests. Starting theme is `system` (resolving light, `aria-pressed="false"`); two clicks advance system → light → dark.

- [ ] **Step 5: Write the failing test `src/components/Nav.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import Nav, { SECTIONS } from './Nav'

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  )
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn().mockReturnValue({ observe: vi.fn(), disconnect: vi.fn(), unobserve: vi.fn() }),
  )
})

afterEach(() => vi.unstubAllGlobals())

describe('Nav', () => {
  it('renders one anchor per section, pointing at its fragment', () => {
    render(<Nav />)
    for (const section of SECTIONS) {
      const link = screen.getByRole('link', { name: section.label })
      expect(link).toHaveAttribute('href', `#${section.id}`)
    }
  })

  it('renders the name as the brand', () => {
    render(<Nav />)
    expect(screen.getByRole('navigation')).toHaveTextContent('Kevin El-Saikali')
  })
})
```

- [ ] **Step 6: Run the test to verify it fails**

```bash
npm test -- Nav
```

Expected: FAIL — cannot resolve `./Nav`.

- [ ] **Step 7: Write `src/hooks/useScrollSpy.ts`**

```ts
import { useEffect, useState } from 'react'

export function useScrollSpy(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    if (typeof IntersectionObserver !== 'function') return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const top = visible[0]
        if (top) setActive(top.target.id)
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: [0, 0.25, 0.5, 1] },
    )

    for (const id of ids) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }

    return () => observer.disconnect()
  }, [ids])

  return active
}
```

- [ ] **Step 8: Write `src/components/Nav.tsx`**

```tsx
import { profile } from '../data/profile'
import { useScrollSpy } from '../hooks/useScrollSpy'
import ThemeToggle from './ThemeToggle'

export const SECTIONS = [
  { id: 'work', label: 'Work' },
  { id: 'earlier', label: 'Earlier' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
] as const

const SECTION_IDS = SECTIONS.map((section) => section.id)

export default function Nav() {
  const active = useScrollSpy(SECTION_IDS)

  return (
    <nav className="nav" aria-label="Primary">
      <div className="page nav__inner">
        <a className="nav__brand" href="#top">
          {profile.name}
        </a>
        <ul className="nav__links mono">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={active === section.id ? 'true' : undefined}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
        <ThemeToggle />
      </div>
    </nav>
  )
}
```

- [ ] **Step 9: Run the test to verify it passes**

```bash
npm test -- Nav
```

Expected: PASS, 2 tests.

- [ ] **Step 10: Append nav styles to `src/styles/global.css`**

```css
.nav {
  position: sticky;
  top: 0;
  z-index: 20;
  background: color-mix(in srgb, var(--paper) 88%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--rule);
}

.nav__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--step-3);
  padding-block: var(--step-2);
}

.nav__brand {
  font-family: var(--font-serif);
  font-size: 1rem;
  text-decoration: none;
}

.nav__links {
  display: flex;
  gap: var(--step-3);
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav__links a {
  color: var(--muted);
  text-decoration: none;
}

.nav__links a[aria-current='true'] {
  color: var(--ink);
}

.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--step-1);
  background: none;
  border: 1px solid var(--rule);
  border-radius: 999px;
  color: var(--muted);
  cursor: pointer;
  padding: 0.35rem 0.7rem;
  font: inherit;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

@media (max-width: 40rem) {
  .nav__links,
  .theme-toggle__label {
    display: none;
  }
}
```

- [ ] **Step 11: Commit**

```bash
git add src/components/ThemeToggle.tsx src/components/ThemeToggle.test.tsx \
        src/components/Nav.tsx src/components/Nav.test.tsx \
        src/hooks/useScrollSpy.ts src/styles/global.css package.json package-lock.json
git commit -m "feat: add navigation and theme toggle"
```

---

### Task 6: Hero and StackStrip

**Files:**
- Create: `src/components/Hero.tsx`, `src/components/StackStrip.tsx`
- Test: `src/components/Hero.test.tsx`

**Interfaces:**
- Consumes: `profile` and `skillGroups` from Task 3.
- Produces: `<Hero />`, `<StackStrip />` — both zero-prop.

- [ ] **Step 1: Write the failing test `src/components/Hero.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import Hero from './Hero'
import StackStrip from './StackStrip'

describe('Hero', () => {
  it('renders the name in the level-1 heading', () => {
    render(<Hero />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('I build things')
  })

  it('states current study and availability', () => {
    render(<Hero />)
    expect(screen.getByText(/University of Ottawa/)).toBeInTheDocument()
    expect(screen.getByText(/New-grad software engineering roles/)).toBeInTheDocument()
  })
})

describe('StackStrip', () => {
  it('renders every skill group with its items', () => {
    render(<StackStrip />)
    expect(screen.getByText('Languages')).toBeInTheDocument()
    expect(screen.getByText(/TypeScript/)).toBeInTheDocument()
    expect(screen.getByText(/Supabase/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test -- Hero
```

Expected: FAIL — cannot resolve `./Hero`.

- [ ] **Step 3: Write `src/components/Hero.tsx`**

```tsx
import { profile } from '../data/profile'

export default function Hero() {
  return (
    <header className="hero page" id="top">
      <div className="hero__main">
        <p className="mono hero__eyebrow">{profile.eyebrow}</p>
        <h1 className="hero__headline">
          {profile.headlineLead}
          <br />
          <em>{profile.headlineAccent}</em>.
        </h1>
      </div>
      <dl className="hero__meta mono">
        <dt>Currently</dt>
        <dd>{profile.currently}</dd>
        <dt>Open to</dt>
        <dd>{profile.availability}</dd>
      </dl>
    </header>
  )
}
```

- [ ] **Step 4: Write `src/components/StackStrip.tsx`**

```tsx
import { skillGroups } from '../data/skills'

export default function StackStrip() {
  return (
    <div className="strip">
      <div className="page strip__inner">
        {skillGroups.map((group) => (
          <div key={group.label} className="strip__group">
            <p className="mono strip__label">{group.label}</p>
            <p className="strip__items">{group.items.join(' · ')}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
npm test -- Hero
```

Expected: PASS, 3 tests.

- [ ] **Step 6: Append hero and strip styles to `src/styles/global.css`**

```css
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--step-4);
  align-items: end;
  padding-block: var(--step-5) var(--step-4);
}

.hero__eyebrow {
  color: var(--accent);
  margin: 0 0 var(--step-3);
}

.hero__headline {
  font-size: clamp(2.5rem, 8vw, 4.5rem);
}

.hero__headline em {
  font-style: italic;
  color: var(--accent);
}

.hero__meta {
  margin: 0;
  text-align: right;
  color: var(--muted);
  font-size: 0.66rem;
}

.hero__meta dt {
  color: var(--accent);
  margin-top: var(--step-2);
}

.hero__meta dd {
  margin: 0.2rem 0 0;
  color: var(--ink);
  text-transform: none;
  letter-spacing: 0.02em;
}

.strip {
  border-block: 1px solid var(--rule);
}

.strip__inner {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
}

.strip__group {
  padding: var(--step-2) var(--step-2) var(--step-2) 0;
}

.strip__label {
  color: var(--muted);
  margin: 0 0 0.35rem;
}

.strip__items {
  margin: 0;
  font-size: 0.82rem;
}

@media (max-width: 48rem) {
  .hero {
    grid-template-columns: minmax(0, 1fr);
  }

  .hero__meta {
    text-align: left;
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components/Hero.tsx src/components/StackStrip.tsx src/components/Hero.test.tsx src/styles/global.css
git commit -m "feat: add hero and stack strip"
```

---

### Task 7: SectionHead, ProjectRow and ProjectList

**Files:**
- Create: `src/components/SectionHead.tsx`, `src/components/ProjectRow.tsx`, `src/components/ProjectList.tsx`
- Test: `src/components/ProjectRow.test.tsx`

**Interfaces:**
- Consumes: `Project` from `src/types.ts`.
- Produces:
  - `<SectionHead index={string} title={string} count={number} />`
  - `<ProjectRow project={Project} index={number} />` — `index` is 1-based, rendered zero-padded
  - `<ProjectList projects={readonly Project[]} />`

- [ ] **Step 1: Write the failing test `src/components/ProjectRow.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import type { Project } from '../types'
import ProjectRow from './ProjectRow'

const linked: Project = {
  id: 'linked',
  title: 'Linked Project',
  year: 2026,
  category: 'client',
  summary: 'A project that has somewhere to point at.',
  stack: ['React', 'TypeScript'],
  links: [{ label: 'Live', href: 'https://example.com' }],
}

const unlinked: Project = {
  id: 'unlinked',
  title: 'Unlinked Project',
  year: 2025,
  category: 'course',
  summary: 'A project whose repository is private.',
  stack: ['Java'],
  links: [],
  note: 'Private team repo',
}

describe('ProjectRow', () => {
  it('renders each link as a safe external anchor', () => {
    render(<ProjectRow project={linked} index={1} />)
    const link = screen.getByRole('link', { name: /Live/ })
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders the note and no links when the project has none', () => {
    render(<ProjectRow project={unlinked} index={2} />)
    expect(screen.getByText('Private team repo')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders the title, year and every stack entry', () => {
    render(<ProjectRow project={linked} index={1} />)
    expect(screen.getByRole('heading', { name: 'Linked Project' })).toBeInTheDocument()
    expect(screen.getByText('2026')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('zero-pads the index', () => {
    render(<ProjectRow project={linked} index={3} />)
    expect(screen.getByText('03')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test -- ProjectRow
```

Expected: FAIL — cannot resolve `./ProjectRow`.

- [ ] **Step 3: Write `src/components/ProjectRow.tsx`**

```tsx
import type { Project } from '../types'

type Props = {
  project: Project
  index: number
}

export default function ProjectRow({ project, index }: Props) {
  return (
    <li className="row">
      <span className="mono row__idx">{String(index).padStart(2, '0')}</span>

      <div className="row__body">
        <h3 className="row__title">{project.title}</h3>
        <p className="row__summary">{project.summary}</p>
        <ul className="row__tags">
          {project.stack.map((item) => (
            <li key={item} className="mono row__tag">
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mono row__meta">
        <span className="row__year">{project.year}</span>
        {project.links.map((link) => (
          <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
            {link.label} ↗
          </a>
        ))}
        {project.links.length === 0 && project.note ? (
          <span className="row__note">{project.note}</span>
        ) : null}
      </div>
    </li>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npm test -- ProjectRow
```

Expected: PASS, 4 tests.

- [ ] **Step 5: Write `src/components/SectionHead.tsx`**

```tsx
type Props = {
  index: string
  title: string
  count: number
}

export default function SectionHead({ index, title, count }: Props) {
  return (
    <div className="sechead">
      <span className="mono sechead__num">{index}</span>
      <h2 className="sechead__title">{title}</h2>
      <span className="sechead__rule" aria-hidden="true" />
      <span className="mono sechead__count">
        {String(count).padStart(2, '0')} {count === 1 ? 'project' : 'projects'}
      </span>
    </div>
  )
}
```

- [ ] **Step 6: Write `src/components/ProjectList.tsx`**

```tsx
import type { Project } from '../types'
import ProjectRow from './ProjectRow'

type Props = {
  projects: readonly Project[]
}

export default function ProjectList({ projects }: Props) {
  return (
    <ul className="rows">
      {projects.map((project, position) => (
        <ProjectRow key={project.id} project={project} index={position + 1} />
      ))}
    </ul>
  )
}
```

- [ ] **Step 7: Append project styles to `src/styles/global.css`**

```css
.sechead {
  display: flex;
  align-items: baseline;
  gap: var(--step-2);
  padding-block: var(--step-4) var(--step-1);
}

.sechead__num {
  color: var(--accent);
}

.sechead__title {
  font-size: 1.4rem;
}

.sechead__rule {
  flex: 1;
  height: 1px;
  background: var(--rule);
}

.sechead__count {
  color: var(--muted);
}

.rows {
  list-style: none;
  margin: 0;
  padding: 0;
}

.row {
  display: grid;
  grid-template-columns: 2.2rem minmax(0, 1fr) 9rem;
  gap: var(--step-3);
  padding-block: var(--step-3);
  border-bottom: 1px solid var(--rule);
}

.row:last-child {
  border-bottom: 0;
}

.row__idx {
  color: var(--muted);
  padding-top: 0.5rem;
}

.row__title {
  font-size: 1.3rem;
  margin-bottom: 0.4rem;
}

.row__summary {
  margin: 0;
  max-width: var(--measure);
  color: var(--muted);
  font-size: 0.92rem;
}

.row__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  list-style: none;
  margin: var(--step-2) 0 0;
  padding: 0;
}

.row__tag {
  border: 1px solid var(--rule);
  border-radius: 3px;
  padding: 0.2rem 0.5rem;
  color: var(--muted);
  background: var(--paper-raised);
  font-size: 0.6rem;
}

.row__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.3rem;
  text-align: right;
  color: var(--muted);
  padding-top: 0.5rem;
}

.row__meta a {
  color: var(--accent);
  text-decoration: none;
}

.row__meta a:hover {
  text-decoration: underline;
}

.row__year {
  color: var(--ink);
}

.row__note {
  font-style: normal;
  opacity: 0.8;
  text-transform: none;
  letter-spacing: 0.04em;
}

@media (max-width: 48rem) {
  .row {
    grid-template-columns: 1.8rem minmax(0, 1fr);
  }

  .row__meta {
    grid-column: 2;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
    gap: var(--step-2);
    text-align: left;
    padding-top: var(--step-2);
  }
}
```

- [ ] **Step 8: Commit**

```bash
git add src/components/SectionHead.tsx src/components/ProjectRow.tsx \
        src/components/ProjectList.tsx src/components/ProjectRow.test.tsx src/styles/global.css
git commit -m "feat: add project rows and section headings"
```

---

### Task 8: About, Contact and Footer

**Files:**
- Create: `src/components/About.tsx`, `src/components/Contact.tsx`, `src/components/Footer.tsx`
- Test: `src/components/Contact.test.tsx`

**Interfaces:**
- Consumes: `profile` from Task 3.
- Produces: `<About />`, `<Contact />`, `<Footer />` — all zero-prop.

- [ ] **Step 1: Write the failing test `src/components/Contact.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import About from './About'
import Contact from './Contact'

describe('Contact', () => {
  it('links the email address with mailto', () => {
    render(<Contact />)
    const link = screen.getByRole('link', { name: /kelsa068@uottawa.ca/ })
    expect(link).toHaveAttribute('href', 'mailto:kelsa068@uottawa.ca')
  })

  it('renders GitHub and LinkedIn as external links', () => {
    render(<Contact />)
    for (const name of ['GitHub', 'LinkedIn']) {
      const link = screen.getByRole('link', { name: new RegExp(name) })
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
  })

  it('publishes no phone number and no street address', () => {
    const { container } = render(<Contact />)
    expect(container.querySelector('a[href^="tel:"]')).toBeNull()
    expect(container.textContent ?? '').not.toMatch(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/)
    expect((container.textContent ?? '').toLowerCase()).not.toContain('laurier')
  })

  it('renders no form, because there is no backend to receive one', () => {
    const { container } = render(<Contact />)
    expect(container.querySelector('form')).toBeNull()
  })
})

describe('About', () => {
  it('never calls Kevin a designer', () => {
    const { container } = render(<About />)
    const text = (container.textContent ?? '').toLowerCase()
    expect(text).not.toContain('ui/ux')
    expect(text).not.toContain('designer')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test -- Contact
```

Expected: FAIL — cannot resolve `./About`.

- [ ] **Step 3: Write `src/components/About.tsx`**

```tsx
import { profile } from '../data/profile'

export default function About() {
  return (
    <div className="about">
      <p className="about__body">{profile.bio}</p>
    </div>
  )
}
```

- [ ] **Step 4: Write `src/components/Contact.tsx`**

```tsx
import { profile } from '../data/profile'

export default function Contact() {
  return (
    <div className="contact">
      <p className="contact__lead">
        The fastest way to reach me is email. I read everything that arrives.
      </p>
      <ul className="contact__list mono">
        <li>
          <span className="contact__label">Email</span>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </li>
        {profile.socials.map((social) => (
          <li key={social.href}>
            <span className="contact__label">{social.label}</span>
            <a href={social.href} target="_blank" rel="noopener noreferrer">
              {social.label} ↗
            </a>
          </li>
        ))}
        <li>
          <span className="contact__label">Location</span>
          <span>{profile.location}</span>
        </li>
      </ul>
    </div>
  )
}
```

- [ ] **Step 5: Write `src/components/Footer.tsx`**

```tsx
import { profile } from '../data/profile'

export default function Footer() {
  return (
    <footer className="foot">
      <div className="page foot__inner mono">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span>Built with React, TypeScript and Vite</span>
      </div>
    </footer>
  )
}
```

- [ ] **Step 6: Run the test to verify it passes**

```bash
npm test -- Contact
```

Expected: PASS, 5 tests.

- [ ] **Step 7: Append about, contact and footer styles to `src/styles/global.css`**

```css
.about__body {
  max-width: var(--measure);
  font-size: 1.05rem;
  margin: var(--step-2) 0 var(--step-4);
}

.contact__lead {
  max-width: var(--measure);
  color: var(--muted);
  margin: var(--step-2) 0 var(--step-3);
}

.contact__list {
  list-style: none;
  margin: 0 0 var(--step-5);
  padding: 0;
  display: grid;
  gap: var(--step-2);
}

.contact__list li {
  display: flex;
  gap: var(--step-2);
  align-items: baseline;
}

.contact__label {
  color: var(--muted);
  min-width: 6rem;
}

.contact__list a {
  color: var(--accent);
  text-decoration: none;
  text-transform: none;
  letter-spacing: 0.02em;
}

.contact__list a:hover {
  text-decoration: underline;
}

.foot {
  border-top: 1px solid var(--rule);
}

.foot__inner {
  display: flex;
  justify-content: space-between;
  gap: var(--step-2);
  flex-wrap: wrap;
  padding-block: var(--step-3);
  color: var(--muted);
}
```

- [ ] **Step 8: Commit**

```bash
git add src/components/About.tsx src/components/Contact.tsx src/components/Footer.tsx \
        src/components/Contact.test.tsx src/styles/global.css
git commit -m "feat: add about, contact and footer"
```

---

### Task 9: Compose the page

**Files:**
- Modify: `src/App.tsx`, `src/App.test.tsx`

**Interfaces:**
- Consumes: every component from Tasks 5–8, `projects` from Task 3, `SECTIONS` from Task 5.
- Produces: the finished page. `App` remains a zero-prop default export.

- [ ] **Step 1: Replace `src/App.test.tsx` with the failing composition test**

```tsx
import { render, screen } from '@testing-library/react'
import App from './App'
import { projects } from './data/projects'

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  )
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn().mockReturnValue({ observe: vi.fn(), disconnect: vi.fn(), unobserve: vi.fn() }),
  )
})

afterEach(() => vi.unstubAllGlobals())

describe('App', () => {
  it('exposes exactly one main landmark', () => {
    render(<App />)
    expect(screen.getAllByRole('main')).toHaveLength(1)
  })

  it('offers a skip link to the main content', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: /skip to content/i })).toHaveAttribute(
      'href',
      '#main',
    )
  })

  it('renders every project exactly once', () => {
    render(<App />)
    for (const project of projects) {
      expect(
        screen.getAllByRole('heading', { name: project.title }),
        project.title,
      ).toHaveLength(1)
    }
  })

  it('leads the work section with Psaltikon Library', () => {
    render(<App />)
    const headings = screen.getAllByRole('heading', { level: 3 })
    expect(headings[0]).toHaveTextContent('Psaltikon Library')
  })

  it('renders the four numbered section headings', () => {
    render(<App />)
    for (const title of ['Selected work', 'Earlier work', 'About', 'Contact']) {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    }
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test -- App
```

Expected: FAIL — no `main` landmark, no skip link.

- [ ] **Step 3: Write `src/App.tsx`**

```tsx
import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Hero from './components/Hero'
import Nav from './components/Nav'
import ProjectList from './components/ProjectList'
import SectionHead from './components/SectionHead'
import StackStrip from './components/StackStrip'
import { projects } from './data/projects'

const featured = projects.filter((project) => project.featured)
const earlier = projects.filter((project) => !project.featured)

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <Nav />
      <Hero />
      <StackStrip />

      <main id="main">
        <section id="work" className="page" aria-labelledby="work-heading">
          <SectionHead index="01" title="Selected work" count={featured.length} />
          <ProjectList projects={featured} />
        </section>

        <section id="earlier" className="page" aria-labelledby="earlier-heading">
          <SectionHead index="02" title="Earlier work" count={earlier.length} />
          <ProjectList projects={earlier} />
        </section>

        <section id="about" className="page" aria-labelledby="about-heading">
          <SectionHead index="03" title="About" count={0} />
          <About />
        </section>

        <section id="contact" className="page" aria-labelledby="contact-heading">
          <SectionHead index="04" title="Contact" count={0} />
          <Contact />
        </section>
      </main>

      <Footer />
    </>
  )
}
```

- [ ] **Step 4: Make `SectionHead` omit the count when it is zero**

Replace the count expression in `src/components/SectionHead.tsx` so About and Contact do not read "00 projects":

```tsx
      {count > 0 ? (
        <span className="mono sechead__count">
          {String(count).padStart(2, '0')} {count === 1 ? 'project' : 'projects'}
        </span>
      ) : null}
```

- [ ] **Step 5: Give each `SectionHead` title the id its section references**

In `src/components/SectionHead.tsx`, change the `Props` type and the heading so `aria-labelledby` resolves:

```tsx
type Props = {
  index: string
  title: string
  count: number
  headingId: string
}
```

```tsx
      <h2 className="sechead__title" id={headingId}>
        {title}
      </h2>
```

Then pass it from `src/App.tsx` — `headingId="work-heading"`, `"earlier-heading"`, `"about-heading"`, `"contact-heading"` respectively.

- [ ] **Step 6: Run the full suite**

```bash
npm test
```

Expected: every test passes, including the earlier `ProjectRow` and `Hero` suites.

- [ ] **Step 7: Verify typecheck and build**

```bash
npm run typecheck && npm run build
```

Expected: both exit 0.

- [ ] **Step 8: Look at the page**

```bash
npm run dev
```

Open the printed URL. Confirm by eye: the hero headline wraps sensibly, Psaltikon leads the work list, the theme toggle cycles light → dark → system with no white flash on reload in dark mode, and the layout holds at a 375px viewport width.

- [ ] **Step 9: Commit**

```bash
git add src/App.tsx src/App.test.tsx src/components/SectionHead.tsx
git commit -m "feat: compose the portfolio page"
```

---

### Task 10: Link checker

**Files:**
- Create: `scripts/check-links.ts`, `.github/workflows/links.yml`
- Test: manual run against live data

**Interfaces:**
- Consumes: `projects` from Task 3, `profile` from Task 3.
- Produces: `npm run check-links`, exiting 0 when every URL is reachable and 1 otherwise.

- [ ] **Step 1: Write `scripts/check-links.ts`**

```ts
import { profile } from '../src/data/profile'
import { projects } from '../src/data/projects'

type Target = { source: string; href: string }

function collect(): Target[] {
  const targets: Target[] = []

  for (const project of projects) {
    for (const link of project.links) {
      targets.push({ source: `${project.id} → ${link.label}`, href: link.href })
    }
  }

  for (const social of profile.socials) {
    targets.push({ source: `profile → ${social.label}`, href: social.href })
  }

  return targets
}

async function check(target: Target): Promise<{ target: Target; ok: boolean; detail: string }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15_000)

  try {
    // Some hosts reject HEAD; fall back to GET before judging a link dead.
    let response = await fetch(target.href, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
    })

    if (response.status === 405 || response.status === 403 || response.status === 404) {
      response = await fetch(target.href, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
      })
    }

    return { target, ok: response.ok, detail: String(response.status) }
  } catch (error) {
    return { target, ok: false, detail: error instanceof Error ? error.message : 'unknown error' }
  } finally {
    clearTimeout(timer)
  }
}

const results = await Promise.all(collect().map(check))
const failures = results.filter((result) => !result.ok)

for (const result of results) {
  const mark = result.ok ? 'ok  ' : 'FAIL'
  console.log(`${mark} ${result.detail.padEnd(6)} ${result.target.source} — ${result.target.href}`)
}

if (failures.length > 0) {
  console.error(`\n${failures.length} link(s) unreachable.`)
  process.exit(1)
}

console.log(`\nAll ${results.length} links reachable.`)
```

- [ ] **Step 2: Run it against live data**

```bash
npm run check-links
```

Expected: exit 0, with one `ok` line per link. Every URL in `projects.ts` was verified reachable while the spec was written; a failure here means something changed since, and the URL — not the script — needs fixing.

- [ ] **Step 3: Confirm it actually fails on a bad URL**

Temporarily add a link with `href: 'https://gb2g.github.io/this-does-not-exist/'` to any project in `src/data/projects.ts`, then:

```bash
npm run check-links; echo "exit=$?"
```

Expected: `exit=1` and a `FAIL` line for that URL. **Remove the temporary link before continuing.**

- [ ] **Step 4: Write `.github/workflows/links.yml`**

```yaml
name: Link check

on:
  pull_request:
  schedule:
    - cron: '0 13 * * 1'
  workflow_dispatch:

jobs:
  links:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run check-links
```

- [ ] **Step 5: Commit**

```bash
git add scripts/check-links.ts .github/workflows/links.yml
git commit -m "feat: add outbound link checker and weekly workflow"
```

---

### Task 11: Deploy workflow, legacy removal, README

**Files:**
- Create: `.github/workflows/deploy.yml`
- Delete: `about.html`, `projects.html`, `project1.html`, `project3.html`, `project4.html`, `assets/bootstrap/`, `assets/css/`, `assets/js/`, `assets/fonts/`
- Modify: `README.md`

**Interfaces:**
- Consumes: the `npm run build` output from Task 1.
- Produces: a published site at `https://gb2g.github.io/`.

- [ ] **Step 1: Write `.github/workflows/deploy.yml`**

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

> The link check is deliberately absent from this workflow. A third-party host having a bad minute must not block publishing an unrelated fix.

- [ ] **Step 2: Delete the legacy site**

`index.html` was already overwritten in Task 1. `assets/img/` is kept.

```bash
git rm -r --quiet about.html projects.html project1.html project3.html project4.html \
              assets/bootstrap assets/css assets/js assets/fonts
```

- [ ] **Step 3: Verify nothing still references the deleted assets**

```bash
grep -rniE 'bootstrap|aos\.min|fontawesome|assets/(css|js|fonts)' --include='*.html' --include='*.ts' --include='*.tsx' . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=docs || echo "no stale references"
```

Expected: `no stale references`.

- [ ] **Step 4: Rewrite `README.md`**

```markdown
# gb2g.github.io

Personal software engineering portfolio for Kevin El-Saikali — fourth-year
software engineering student at the University of Ottawa.

Live at **https://gb2g.github.io**.

## Stack

Vite · React 19 · TypeScript (strict) · Vitest · GitHub Actions → GitHub Pages.

No framework beyond React and no router: the site is a single scrolling page, so
every anchor works on a static host without rewrite rules.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Typecheck, then production build to `dist/` |
| `npm test` | Unit and component tests (Vitest + Testing Library) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run check-links` | Requests every outbound URL in `src/data/`, fails on any that is unreachable |

## Adding a project

Append one object to `src/data/projects.ts`. Nothing else needs to change — no
component contains a project name, date or URL.

A project with no public link is valid: give it `links: []` and a `note`
explaining why, and it renders without a dangling anchor.

## Deployment

Every push to `main` runs typecheck, tests and build, then publishes `dist/` to
GitHub Pages. Link checking runs separately — on pull requests and weekly — and
does not gate deploys, because an outage on someone else's host should not block
shipping.
```

- [ ] **Step 5: Run the full verification sweep**

```bash
npm run typecheck && npm test && npm run build && npm run check-links
```

Expected: all four exit 0.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Pages deploy workflow, remove legacy site, rewrite README"
```

- [ ] **Step 7: Push the branch**

```bash
git push -u origin redesign
```

- [ ] **Step 8: Switch the Pages source — repo owner, manual, once**

In the browser: **Settings → Pages → Build and deployment → Source → GitHub Actions**.

This cannot be done from git. Until it is switched from "Deploy from a branch", the deploy workflow will run green while the old site stays live.

- [ ] **Step 9: Merge and verify the live site**

```bash
git checkout main
git merge --no-ff redesign -m "feat: rebuild portfolio as a software engineering site"
git push
```

Then watch the Deploy workflow finish and load `https://gb2g.github.io/` in a
browser. **Confirm the page actually changed** — a green check with the old
Bootstrap site still showing means Step 8 was not completed.

- [ ] **Step 10: Manual accessibility pass**

With the live site open:

1. Press Tab from the top — the first stop must be "Skip to content".
2. Tab through the nav and every project link; each must show a visible focus ring.
3. Toggle the theme through all three states; reload in dark mode and confirm no white flash.
4. Run Lighthouse (Chrome DevTools → Lighthouse → Accessibility + Performance). Investigate anything below 95.
5. Enable "Reduce motion" in the OS and confirm smooth scrolling stops.

---

## Self-Review

**Spec coverage**

| Spec requirement | Task |
| --- | --- |
| Editorial layout, mono metadata | 2, 6, 7 |
| Newsreader / Inter / JetBrains Mono, self-hosted | 2 |
| Token table, dark mode redefines colour only | 2 |
| Contrast verified at AA | 2 (enforced by test) |
| Vite + React + TS, `base: '/'` | 1 |
| No router, anchor navigation | 1, 5, 9 |
| File layout as specified | 1–9 |
| `Project` type incl. `links: []` + `note` | 3 |
| Tri-state theme, pre-paint script, storage try/catch | 4 |
| Fourth-year positioning, availability strings | 3 |
| Stack strip incl. SQL / Supabase / PostgreSQL | 3, 6 |
| Designer copy removed | 3, 8 (asserted by test) |
| Psaltikon leads, principal-developer attribution | 3, 9 |
| Team-project labelling | 3 |
| Earlier work, private-repo notes | 3 |
| Email + socials only; phone and address removed | 3, 8 (asserted by test) |
| Contact form deleted, not rebuilt | 8 (asserted by test) |
| Landmarks, skip link, focus-visible, reduced motion, `aria-pressed`, `aria-current` | 2, 5, 9, 11 |
| typecheck / test / build gate deploy | 11 |
| check-links does not gate deploy | 10, 11 |
| Legacy file removal, `assets/img/` retained | 11 |
| README rewritten | 11 |
| Pages source manual step flagged | 11 |

No gaps.

**Placeholder scan:** no TBDs, no "add error handling", no "similar to Task N". Every code step carries complete code.

**Type consistency:** `Project`, `ProjectLink`, `SkillGroup`, `Profile`, `Theme`, `ResolvedTheme` are defined once in Task 3 and imported by type-only imports thereafter. `resolveTheme` / `readStoredTheme` / `useTheme` / `THEME_STORAGE_KEY` are exported in Task 4 and consumed with matching names in Task 5. `SectionHead`'s props gain `headingId` in Task 9 Step 5, and Task 9 Step 5 updates every call site in the same step — no other task constructs a `SectionHead`.

**Known ordering note:** Task 1 is the single task where implementation precedes the test, because no test can execute before the toolchain exists. This is called out in the task itself. Tasks 2–11 are strictly test-first.
