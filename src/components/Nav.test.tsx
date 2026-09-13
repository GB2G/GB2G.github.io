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
