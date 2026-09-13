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

  it('renders the capitalised category label', () => {
    render(<ProjectRow project={linked} index={1} />)
    expect(screen.getByText('Client')).toBeInTheDocument()
  })
})
