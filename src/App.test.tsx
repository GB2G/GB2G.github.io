import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the name as a heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Kevin El-Saikali' })).toBeInTheDocument()
  })
})
