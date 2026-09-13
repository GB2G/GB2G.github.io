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
