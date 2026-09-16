import { useReveal } from '../hooks/useReveal'
import { skillGroups } from '../data/skills'

export default function StackStrip() {
  const { ref, isVisible } = useReveal<HTMLDivElement>()

  return (
    <div className="strip">
      <div ref={ref} className={`page strip__inner reveal-stagger${isVisible ? ' is-visible' : ''}`}>
        {skillGroups.map((group) => (
          <div key={group.label} className="strip__group">
            <p className="mono strip__label">{group.label}</p>
            <p className="strip__items">{group.items.join(' · ')}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
