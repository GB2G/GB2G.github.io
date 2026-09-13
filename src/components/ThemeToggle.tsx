import { useTheme } from '../hooks/useTheme'

const GLYPH = { light: '☀', dark: '☾', system: '◐' } as const

export default function ThemeToggle() {
  const { theme, resolved, cycle } = useTheme()

  return (
    <button
      type="button"
      className="mono theme-toggle"
      onClick={cycle}
      aria-pressed={resolved === 'dark'}
      aria-label={`Theme: ${theme}. Activate to change.`}
    >
      <span aria-hidden="true">{GLYPH[theme]}</span>
      <span className="theme-toggle__label">{theme}</span>
    </button>
  )
}
