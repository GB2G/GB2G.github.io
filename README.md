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
