import { act, renderHook } from '@testing-library/react'
import { readStoredTheme, resolveTheme, useTheme, THEME_STORAGE_KEY } from './useTheme'

function stubMatchMedia(matches: boolean) {
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
  localStorage.clear()
  stubMatchMedia(false)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('resolveTheme', () => {
  it('returns the explicit choice regardless of system preference', () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })

  it('follows the system preference when set to system', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
  })
})

describe('readStoredTheme', () => {
  it('defaults to system when nothing is stored', () => {
    expect(readStoredTheme()).toBe('system')
  })

  it('defaults to system when the stored value is not a valid theme', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'chartreuse')
    expect(readStoredTheme()).toBe('system')
  })

  it('returns system instead of throwing when storage is unavailable', () => {
    vi.stubGlobal('localStorage', {
      getItem() {
        throw new Error('SecurityError')
      },
      setItem() {
        throw new Error('SecurityError')
      },
    })
    expect(readStoredTheme()).toBe('system')
  })

  it('agrees with the inline script when storage throws but system is dark', () => {
    vi.stubGlobal('localStorage', {
      getItem() {
        throw new Error('SecurityError')
      },
      setItem() {
        throw new Error('SecurityError')
      },
    })
    stubMatchMedia(true)
    // When storage is unavailable, readStoredTheme returns 'system',
    // and resolveTheme('system', true) must be 'dark' to prevent flash
    expect(resolveTheme(readStoredTheme(), true)).toBe('dark')
  })
})

describe('useTheme', () => {
  it('cycles light to dark to system and writes data-theme', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light')
    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('light')
    expect(document.documentElement.dataset['theme']).toBe('light')

    act(() => result.current.cycle())
    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.dataset['theme']).toBe('dark')

    act(() => result.current.cycle())
    expect(result.current.theme).toBe('system')
    expect(result.current.resolved).toBe('light')

    act(() => result.current.cycle())
    expect(result.current.theme).toBe('light')
  })
})
