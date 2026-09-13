# Portfolio Redesign — Design

**Date:** 2026-09-13
**Repo:** `GB2G.github.io` (GitHub Pages user site)
**Status:** Approved, ready for implementation planning

## Problem

The existing site is a SEG3525 course deliverable. It presents Kevin El-Saikali as a
second-year *UI/UX design* student, is built on Bootstrap 5 + AOS + Font Awesome, and
its content is eighteen months stale. Two of its outbound project links 404. Its
contact form has no backend, so submissions are silently discarded. None of the five
applications built during 2026 appear on it — including the largest, a live
multi-user library application under active development.

The site's job is changing: it must now work as a **software engineering portfolio**
aimed at recruiters and hiring managers, for a fourth-year student seeking new-grad
roles.

## Goals

1. Present the work as engineering, not design coursework.
2. Surface the 2026 projects, led by Psaltikon Library — the only one with
   authentication, a relational schema and an admin surface.
3. Nothing on the site 404s.
4. Adding a project later means appending one object to one file.

## Non-goals

- Per-project detail pages. The existing `project1/3/4.html` stubs were never filled in;
  a one-paragraph summary plus links to live site and source is sufficient and honest.
- A CMS, a blog, or analytics.
- Project screenshots in v1. The layout is text-first by design. Screenshots can be
  added later behind the existing `Project` type without a layout change.

---

## 1. Visual direction

Editorial layout with monospace metadata — chosen over a terminal treatment (too
niche for non-technical readers) and a dark gradient product look (the most common
style in the genre, so the least distinguishing).

**The governing rule: monospace for data, serif for prose.**

| Monospace | Serif | Sans |
| --- | --- | --- |
| section numbers, nav, year, stack tags, links, the Currently/Open-to block | name, headline, project titles | body copy, summaries |

This reads as an engineer's document rather than a designer's poster, while keeping
the page quiet enough that the project descriptions carry the weight.

### Type

Self-hosted via `@fontsource` packages — no external font request, so no third-party
round trip on first paint.

- **Serif:** Newsreader (variable, has a true italic — the headline uses it)
- **Sans:** Inter (variable)
- **Mono:** JetBrains Mono — the same face Pitch Partners uses

### Colour

Defined once as custom properties in `tokens.css`. Dark mode redefines only the
colour variables, never the type or spacing scales.

| Token | Light | Dark |
| --- | --- | --- |
| `--paper` | `#faf9f7` | `#101012` |
| `--ink` | `#17171a` | `#e8e6e1` |
| `--muted` | `#6b6862` | `#9a958c` |
| `--rule` | `#e4e0d8` | `#26262a` |
| `--accent` | `#b4451f` | `#e0714a` |

The accent lightens in dark mode because `#b4451f` on `#101012` falls below 4.5:1.
Every foreground/background pair must be verified against WCAG AA before merge.

---

## 2. Architecture

### Stack

Vite + React + TypeScript, built by GitHub Actions, published to GitHub Pages.

### No router — deliberate

The site is one scrolling page with anchor navigation (`#work`, `#about`, `#contact`).

GitHub Pages serves static files with no rewrite support, so a client-side router
means any deep link 404s on refresh or direct load. This is the exact problem the
InkbyOs repo needed a `vercel.json` rewrite to solve, and Pages offers no equivalent.
A single page removes the failure mode rather than working around it, and a portfolio
of this size has no need for routes.

### Layout

```
src/
  main.tsx
  App.tsx
  data/
    profile.ts      name, bio, education, availability, contact, socials
    projects.ts     Project[] — the single source of truth for all work
    skills.ts       the three stack-strip groups (see §3)
  components/
    Nav.tsx         sticky; brand, anchors, ThemeToggle
    Hero.tsx        eyebrow, headline, blurb, side meta block
    StackStrip.tsx  three bordered columns
    SectionHead.tsx numbered rule ("01 — Selected work ———— 05 projects")
    ProjectRow.tsx  one project
    ProjectList.tsx maps a Project[] to rows
    About.tsx
    Contact.tsx
    Footer.tsx
    ThemeToggle.tsx
  hooks/
    useTheme.ts
    useScrollSpy.ts active nav section
  styles/
    tokens.css      design tokens, light + dark
    global.css      reset, base elements, layout primitives
index.html
vite.config.ts
scripts/check-links.ts
.github/workflows/deploy.yml
.github/workflows/links.yml
```

Content is fully separated from presentation. No component contains a project name,
a date, or a URL.

### Data model

```ts
export type ProjectLink = { label: string; href: string }

export type Project = {
  id: string
  title: string
  year: number
  category: 'client' | 'personal' | 'course'
  summary: string           // 1–2 sentences, engineering-focused
  stack: string[]
  links: ProjectLink[]      // [] is valid and meaningful — see below
  note?: string             // shown when links is empty, e.g. "Private team repo"
  featured?: boolean
}
```

`links: []` paired with a `note` is how private and retired work is represented. The
project is still described and still counts as experience; there is simply nothing to
click. This is what keeps the "nothing 404s" goal true without deleting real work.

### Theming

Tri-state — `light` / `dark` / `system` — matching the behaviour the current site
already has. The resolved theme is written to `data-theme` on `<html>`; the user's
choice persists in `localStorage`.

**A blocking inline script in `index.html` applies the stored theme before first
paint.** Without it, a dark-mode visitor gets a white flash on every page load,
because React has not mounted yet when the browser makes its first paint. This script
must stay inline and synchronous — moving it into the bundle reintroduces the flash.

`localStorage` access is wrapped in `try`/`catch`: it throws outright in some
privacy configurations, and an unhandled throw in that script would block render.

---

## 3. Content

### Positioning

Fourth-year BASc Software Engineering, University of Ottawa. Ottawa, ON.

The hero's side block reads `Currently — BASc Software Engineering, University of
Ottawa` and `Open to — New-grad software engineering roles, 2027`, derived from
fourth-year standing in September 2026. Both strings live in `profile.ts` as a single
`availability` field and are a one-line edit if the timing is different.

The page is ordered: `01` Selected work, `02` Earlier work, `03` About, `04` Contact.

### Stack strip

Three groups in `skills.ts`. Data and SQL now belong on this list — the Psaltikon
schema work is a real part of the story and would otherwise be invisible:

| Group | Contents |
| --- | --- |
| Languages | TypeScript, JavaScript, Java, Python, Kotlin, SQL |
| Frameworks | React 19, Next.js, Vite, Tailwind, Framer Motion |
| Platform | Supabase, PostgreSQL, Vercel, GitHub Actions, Node, Android |

The current "As a UI/UX designer, I approach my work by putting the user at the
center of every decision…" passage is removed entirely, along with the
Web design / Development / Hosting service tiles. Those frame the site as a designer
advertising services; the site is now a student applying for engineering roles.

### Selected work — 2026

| Project | Stack | Links |
| --- | --- | --- |
| **Psaltikon Library** | React 19, TypeScript, Vite, Tailwind v4, Supabase (Postgres + Auth + RLS), pdf-lib | Live, Source |
| **Pitch Partners** | Vite, React, Framer Motion, serverless `api/send-booking.js`, Vercel | Live `pitchpartners.ca`, Source |
| **Vanna Noun — Renoun Creation** | Next.js App Router, TypeScript, Tailwind v4, Resend | Source |
| **InkbyOs** | Vite, React 18, TypeScript, Vercel | Live, Source |
| **Blackjack** | React 19, TypeScript, Tailwind v4, Framer Motion | Source |

**Psaltikon Library leads the section**, and the hero copy should reflect that the
portfolio is anchored by a live multi-user application rather than by marketing sites.

It is a digital library of Orthodox Byzantine chant, built under the
`psaltikon-library` GitHub organisation and live at
`psaltikon-library.github.io/psaltikon-library`. Nine routed pages including an admin
dashboard; Supabase Postgres behind it with Supabase Auth and per-user row-level
security policies; twelve SQL migrations between May and August 2026 covering saved
chants, booklets, chant PDFs, a submissions pipeline with a Postgres email trigger,
and security-definer stats views; PDF rendering via `react-pdf` and booklet
generation via `pdf-lib`; deployed by GitHub Actions.

This is the only project in the portfolio with authentication, a relational schema,
an authorization model, an administrative surface, and sustained schema evolution
against live data. It is ordered first for that reason.

Attribution: 82 of the repository's 88 commits are Kevin's, alongside two other
contributors. It is described as an organisation project on which he is the principal
developer — accurate in both directions, neither claiming sole authorship nor
underselling the contribution.

Pitch Partners follows: a marketing and booking site for a professional football
coaching business, live on a domain the client owns, with a working serverless
booking endpoint.

Vanna Noun has no public deployment, so it carries a source link only.

### Earlier work — 2024–2025

| Project | Stack | Links |
| --- | --- | --- |
| RoyalStats | JavaScript | Live, Source |
| Match Mania | JavaScript | Live, Source |
| Precision Cycle Co. | HTML, CSS, JS, Bootstrap — team project | Live |
| St. Elias Bookstore | HTML, CSS, JS, Bootstrap — team project | Live |
| FreshAlert | team project | *none — "Private team repo"* |
| PC Builders | Java, Android — SEG2505 team project | *none — "Private course repo"* |

Precision Cycle Co. and St. Elias Bookstore are hosted on a collaborator's GitHub
Pages account and are labelled as team projects.

### Contact

Email and socials only: `kelsa068@uottawa.ca`, GitHub, LinkedIn. The city stays;
**the phone number and the street address are removed** — a public page indexed by
search engines is the wrong place for either, and recruiters use email or LinkedIn.

**The contact form is deleted, not rebuilt.** It currently posts nowhere, so anything
a visitor types into it is lost. A `mailto:` link and the two social links are honest
about what they do. Adding a real form later means adding a backend, which is out of
scope for a static Pages site.

---

## 4. Accessibility

Not a checkbox exercise — it is the substance of the course this portfolio grew out
of, and a recruiter running Lighthouse is a realistic scenario.

- Semantic landmarks: one `<main>`, `<nav>`, `<header>`, `<footer>`
- A skip link as the first focusable element
- Visible `:focus-visible` styling on every interactive element
- `prefers-reduced-motion: reduce` disables scroll and transition animation
- Contrast verified at AA in both themes
- The theme toggle is a real `<button>` with `aria-label` and `aria-pressed`
- Anchor nav marks the active section with `aria-current`

---

## 5. Verification

| Check | Command | Gates deploy |
| --- | --- | --- |
| Types | `npm run typecheck` (`tsc --noEmit`, strict) | yes |
| Build | `npm run build` | yes |
| Outbound links | `npm run check-links` | **no** |
| Keyboard, reduced motion, contrast, Lighthouse | manual, before merge | — |

`check-links` reads `projects.ts` and `profile.ts`, requests every `href`, and fails
on any non-2xx.

**It runs in its own workflow — on pull requests and on a weekly schedule — and
deliberately does not gate the deploy job.** Those URLs point at third-party hosts.
If `pitchpartners.ca` has a bad minute, that must not be able to block publishing an
unrelated typo fix. Link rot is worth catching loudly and worth catching on a
schedule; it is not worth coupling to your own deploy pipeline.

### Deployment

`deploy.yml` builds on push to `main` and publishes with
`actions/deploy-pages`.

**Manual step, once, by the repo owner:** Settings → Pages → Source → **GitHub
Actions**. Until that is switched from "Deploy from a branch", the workflow runs
green but nothing is published. This cannot be done from git.

### Removals

Deleted: `index.html`, `about.html`, `projects.html`, `project1.html`,
`project3.html`, `project4.html`, `assets/bootstrap/`, `assets/css/`, `assets/js/`,
`assets/fonts/`.

`assets/img/` is retained for now — it holds project imagery that a later screenshot
pass may use. Git history preserves everything regardless.

`README.md` is rewritten: it currently describes a SEG3525 course assignment.

---

## Risks

**The Pages source setting is a silent failure.** The workflow will report success
while the old Bootstrap site stays live. Verify `gb2g.github.io` actually changes
after the first deploy rather than trusting the green check.

**Font loading shifts layout.** Newsreader at 54px will reflow noticeably against a
fallback. Use `font-display: swap` with a metrics-matched fallback stack, and confirm
CLS stays near zero.

**Team-project attribution.** Four entries are team or course work. Each is labelled
as such. Overstating a contribution is the one error on a job-hunting portfolio that
costs more than an outdated design.
