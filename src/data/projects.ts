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
