import { render, screen } from '@testing-library/react'
import About from './About'
import Contact from './Contact'

describe('Contact', () => {
  it('links the email address with mailto', () => {
    render(<Contact />)
    const link = screen.getByRole('link', { name: /kelsa068@uottawa.ca/ })
    expect(link).toHaveAttribute('href', 'mailto:kelsa068@uottawa.ca')
  })

  it('renders GitHub and LinkedIn as external links', () => {
    render(<Contact />)
    for (const name of ['GitHub', 'LinkedIn']) {
      const link = screen.getByRole('link', { name: new RegExp(name) })
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
  })

  it('publishes no phone number and no street address', () => {
    const { container } = render(<Contact />)
    expect(container.querySelector('a[href^="tel:"]')).toBeNull()
    expect(container.textContent ?? '').not.toMatch(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/)
    expect((container.textContent ?? '').toLowerCase()).not.toContain('laurier')
  })

  it('renders no form, because there is no backend to receive one', () => {
    const { container } = render(<Contact />)
    expect(container.querySelector('form')).toBeNull()
  })
})

describe('About', () => {
  it('never calls Kevin a designer', () => {
    const { container } = render(<About />)
    const text = (container.textContent ?? '').toLowerCase()
    expect(text).not.toContain('ui/ux')
    expect(text).not.toContain('designer')
  })
})
