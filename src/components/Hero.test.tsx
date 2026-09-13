import { render, screen } from '@testing-library/react'
import Hero from './Hero'
import StackStrip from './StackStrip'

describe('Hero', () => {
  it('renders the name in the level-1 heading', () => {
    render(<Hero />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Kevin El-Saikali')
  })

  it('renders the tagline beneath the heading', () => {
    render(<Hero />)
    expect(screen.getByText(/I build things/)).toBeInTheDocument()
  })

  it('states current study and availability', () => {
    render(<Hero />)
    expect(screen.getByText(/University of Ottawa/)).toBeInTheDocument()
    expect(screen.getByText(/New-grad software engineering roles/)).toBeInTheDocument()
  })
})

describe('StackStrip', () => {
  it('renders every skill group with its items', () => {
    render(<StackStrip />)
    expect(screen.getByText('Languages')).toBeInTheDocument()
    expect(screen.getByText(/TypeScript/)).toBeInTheDocument()
    expect(screen.getByText(/Supabase/)).toBeInTheDocument()
  })
})
