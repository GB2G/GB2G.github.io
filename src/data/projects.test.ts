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
