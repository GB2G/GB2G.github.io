import { useEffect, useState } from 'react'

const TYPING_MS = 55
const DELETING_MS = 30
const PAUSE_MS = 1800

function prefersReducedMotion(): boolean {
  try {
    return matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

export function useTypewriter(phrases: readonly string[]): string {
  const [text, setText] = useState('')

  useEffect(() => {
    if (phrases.length === 0) return

    if (prefersReducedMotion()) {
      setText(phrases[0] ?? '')
      return
    }

    let phraseIndex = 0
    let charIndex = 0
    let deleting = false
    let timeoutId: ReturnType<typeof setTimeout>

    const tick = () => {
      const current = phrases[phraseIndex] ?? ''

      if (deleting) {
        charIndex -= 1
        setText(current.slice(0, charIndex))

        if (charIndex === 0) {
          deleting = false
          phraseIndex = (phraseIndex + 1) % phrases.length
          timeoutId = setTimeout(tick, TYPING_MS)
          return
        }
        timeoutId = setTimeout(tick, DELETING_MS)
        return
      }

      charIndex += 1
      setText(current.slice(0, charIndex))

      if (charIndex === current.length) {
        deleting = true
        timeoutId = setTimeout(tick, PAUSE_MS)
        return
      }
      timeoutId = setTimeout(tick, TYPING_MS)
    }

    timeoutId = setTimeout(tick, TYPING_MS)

    return () => clearTimeout(timeoutId)
  }, [phrases])

  return text
}
