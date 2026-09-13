import { skillGroups } from '../data/skills'

export default function StackStrip() {
  return (
    <div className="strip">
      <div className="page strip__inner">
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
