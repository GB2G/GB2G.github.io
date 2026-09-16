import { act, render, screen } from '@testing-library/react'
import { useReveal } from './useReveal'

type Callback = (entries: Array<{ isIntersecting: boolean }>) => void

let capturedCallback: Callback | null = null
const observe = vi.fn()
const disconnect = vi.fn()

class MockObserver {
  constructor(callback: Callback) {
    capturedCallback = callback
  }
  observe = observe
  disconnect = disconnect
  unobserve = vi.fn()
}

function Probe() {
  const { ref, isVisible } = useReveal<HTMLDivElement>()
  return (
    <div ref={ref} data-testid="probe">
      {isVisible ? 'visible' : 'hidden'}
    </div>
  )
}

beforeEach(() => {
  capturedCallback = null
  observe.mockClear()
  disconnect.mockClear()
  vi.stubGlobal('IntersectionObserver', vi.fn(MockObserver))
})

afterEach(() => vi.unstubAllGlobals())

describe('useReveal', () => {
  it('starts hidden and observes the mounted element', () => {
    render(<Probe />)
    expect(screen.getByTestId('probe')).toHaveTextContent('hidden')
    expect(observe).toHaveBeenCalledWith(screen.getByTestId('probe'))
  })

  it('becomes visible once the element intersects, then stops observing', () => {
    render(<Probe />)

    act(() => {
      capturedCallback?.([{ isIntersecting: true }])
    })

    expect(screen.getByTestId('probe')).toHaveTextContent('visible')
    expect(disconnect).toHaveBeenCalledTimes(1)
  })

  it('stays hidden while the element has not intersected yet', () => {
    render(<Probe />)

    act(() => {
      capturedCallback?.([{ isIntersecting: false }])
    })

    expect(screen.getByTestId('probe')).toHaveTextContent('hidden')
  })

  it('reveals immediately when IntersectionObserver is unavailable', () => {
    vi.unstubAllGlobals()
    vi.stubGlobal('IntersectionObserver', undefined)

    render(<Probe />)

    expect(screen.getByTestId('probe')).toHaveTextContent('visible')
  })
})
