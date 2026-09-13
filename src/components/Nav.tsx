import { profile } from '../data/profile'
import { useScrollSpy } from '../hooks/useScrollSpy'
import ThemeToggle from './ThemeToggle'

export const SECTIONS = [
  { id: 'work', label: 'Work' },
  { id: 'earlier', label: 'Earlier' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
] as const

const SECTION_IDS = SECTIONS.map((section) => section.id)

export default function Nav() {
  const active = useScrollSpy(SECTION_IDS)

  return (
    <nav className="nav" aria-label="Primary">
      <div className="page nav__inner">
        <a className="nav__brand" href="#top">
          {profile.name}
        </a>
        <ul className="nav__links mono">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={active === section.id ? 'true' : undefined}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
        <ThemeToggle />
      </div>
    </nav>
  )
}
