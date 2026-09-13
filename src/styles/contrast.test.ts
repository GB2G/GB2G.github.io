// @vitest-environment node
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// __dirname does not exist in ESM — resolve relative to this module's URL.
const css = readFileSync(fileURLToPath(new URL('./tokens.css', import.meta.url)), 'utf8')

function block(selector: string): Record<string, string> {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`).exec(css)
  if (!match || match[1] === undefined) throw new Error(`Block not found: ${selector}`)
  const out: Record<string, string> = {}
  for (const line of match[1].split(';')) {
    const [rawName, rawValue] = line.split(':')
    if (!rawName || !rawValue) continue
    out[rawName.trim()] = rawValue.trim()
  }
  return out
}

function srgbToLinear(channel: number): number {
  const c = channel / 255
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function luminance(hex: string): number {
  const clean = hex.replace('#', '')
  const r = Number.parseInt(clean.slice(0, 2), 16)
  const g = Number.parseInt(clean.slice(2, 4), 16)
  const b = Number.parseInt(clean.slice(4, 6), 16)
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
}

function contrast(a: string, b: string): number {
  const l1 = luminance(a)
  const l2 = luminance(b)
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

describe.each([
  ['light', ':root'],
  ['dark', "[data-theme='dark']"],
])('%s theme contrast', (_name, selector) => {
  const tokens = block(selector)

  it.each(['--ink', '--muted', '--accent'])('%s on --paper meets AA', (fg) => {
    const foreground = tokens[fg]
    const background = tokens['--paper']
    expect(foreground, `${fg} missing`).toBeDefined()
    expect(background, '--paper missing').toBeDefined()
    expect(contrast(foreground as string, background as string)).toBeGreaterThanOrEqual(4.5)
  })

  // The skip link paints --paper on --accent. White text here fails in dark mode
  // (3.17:1), which is exactly the kind of regression this test exists to catch.
  it('--paper on --accent meets AA', () => {
    const paper = tokens['--paper']
    const accent = tokens['--accent']
    expect(paper, '--paper missing').toBeDefined()
    expect(accent, '--accent missing').toBeDefined()
    expect(contrast(paper as string, accent as string)).toBeGreaterThanOrEqual(4.5)
  })
})
