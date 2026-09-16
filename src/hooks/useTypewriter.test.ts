import { act, renderHook } from '@testing-library/react'
import { useTypewriter } from './useTypewriter'

// Hoisted to module scope deliberately: an inline array literal passed to
// renderHook's callback is a fresh reference every re-render, which trips
// the hook's `[phrases]` effect dependency and restarts the whole cycle on
// every keystroke. profile.headlineAccents (the real caller) is a stable
// module-level array, so these fixtures mirror that instead of the bug.
const HELLO = ['hello']
const AB_CD = ['ab', 'cd']
const A_B = ['a', 'b']

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  )
}

beforeEach(() => {
  vi.useFakeTimers()
  stubReducedMotion(false)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('useTypewriter', () => {
  it('starts empty and types the first phrase one character at a time', () => {
    const { result } = renderHook(() => useTypewriter(HELLO))
    expect(result.current).toBe('')

    act(() => vi.advanceTimersByTime(55))
    expect(result.current).toBe('h')

    act(() => vi.advanceTimersByTime(55 * 3))
    expect(result.current).toBe('hell')

    act(() => vi.advanceTimersByTime(55))
    expect(result.current).toBe('hello')
  })

  it('holds the full phrase through the pause, then deletes it back to empty', () => {
    const { result } = renderHook(() => useTypewriter(HELLO))

    act(() => vi.advanceTimersByTime(275))
    expect(result.current).toBe('hello')

    // comfortably inside the 1800ms pause
    act(() => vi.advanceTimersByTime(1700))
    expect(result.current).toBe('hello')

    // pause ends at 275 + 1800 = 2075; each deletion tick is 30ms, and
    // 'hell' (charIndex 4) needs 4 more ticks to reach empty (4→3→2→1→0)
    act(() => vi.advanceTimersByTime(100))
    expect(result.current).toBe('hell')

    act(() => vi.advanceTimersByTime(30 * 4))
    expect(result.current).toBe('')
  })

  it('cycles to the next phrase once the current one is fully deleted', () => {
    const { result } = renderHook(() => useTypewriter(AB_CD))

    // type 'ab' (55*2), pause (1800), delete 'ab' (30*2)
    act(() => vi.advanceTimersByTime(55 * 2 + 1800 + 30 * 2))
    expect(result.current).toBe('')

    act(() => vi.advanceTimersByTime(55))
    expect(result.current).toBe('c')
  })

  it('wraps back to the first phrase after the last one', () => {
    const { result } = renderHook(() => useTypewriter(A_B))

    // single-character phrases: typing the one char already hits full
    // length, so the delete tick fires straight after the pause — there is
    // no separate DELETING_MS step to account for
    act(() => vi.advanceTimersByTime((55 + 1800) * 2))
    expect(result.current).toBe('')

    act(() => vi.advanceTimersByTime(55))
    expect(result.current).toBe('a')
  })

  it('renders the first phrase statically when reduced motion is preferred', () => {
    stubReducedMotion(true)
    const { result } = renderHook(() => useTypewriter(['for the web', 'that scale']))

    expect(result.current).toBe('for the web')

    act(() => vi.advanceTimersByTime(10_000))
    expect(result.current).toBe('for the web')
  })

  it('returns an empty string when given no phrases', () => {
    const { result } = renderHook(() => useTypewriter([]))
    expect(result.current).toBe('')

    act(() => vi.advanceTimersByTime(10_000))
    expect(result.current).toBe('')
  })
})
