import { useCallback, useEffect, useState } from 'react'
import type { ResolvedTheme, Theme } from '../types'

export const THEME_STORAGE_KEY = 'portfolio-theme'

const ORDER: readonly Theme[] = ['light', 'dark', 'system']

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system'
}

export function resolveTheme(stored: Theme, prefersDark: boolean): ResolvedTheme {
  if (stored === 'system') return prefersDark ? 'dark' : 'light'
  return stored
}

export function readStoredTheme(): Theme {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(raw) ? raw : 'system'
  } catch {
    return 'system'
  }
}

function writeStoredTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Storage unavailable — the in-memory choice still applies for this page view.
  }
}

function prefersDark(): boolean {
  try {
    return matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

export function useTheme(): { theme: Theme; resolved: ResolvedTheme; cycle: () => void } {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme())
  const [systemDark, setSystemDark] = useState<boolean>(() => prefersDark())

  useEffect(() => {
    const query = matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const resolved = resolveTheme(theme, systemDark)

  useEffect(() => {
    document.documentElement.dataset['theme'] = resolved
  }, [resolved])

  const cycle = useCallback(() => {
    setTheme((current) => {
      const index = ORDER.indexOf(current)
      const next = ORDER[(index + 1) % ORDER.length] ?? 'light'
      writeStoredTheme(next)
      return next
    })
  }, [])

  return { theme, resolved, cycle }
}
