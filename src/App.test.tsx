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
    vi.fn(
      class {
        observe = vi.fn()
        disconnect = vi.fn()
        unobserve = vi.fn()
      },
    ),
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
