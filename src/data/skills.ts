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
