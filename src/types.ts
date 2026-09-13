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
