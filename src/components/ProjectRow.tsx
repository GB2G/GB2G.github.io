import type { Project } from '../types'

type Props = {
  project: Project
  index: number
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default function ProjectRow({ project, index }: Props) {
  return (
    <li className="row">
      <span className="mono row__idx">{String(index).padStart(2, '0')}</span>

      <div className="row__body">
        <h3 className="row__title">{project.title}</h3>
        <p className="row__summary">{project.summary}</p>
        <ul className="row__tags">
          {project.stack.map((item) => (
            <li key={item} className="mono row__tag">
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mono row__meta">
        <span className="mono row__category">{capitalize(project.category)}</span>
        <span className="row__year">{project.year}</span>
        {project.links.map((link) => (
          <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
            {link.label} ↗
          </a>
        ))}
        {project.links.length === 0 && project.note ? (
          <span className="row__note">{project.note}</span>
        ) : null}
      </div>
    </li>
  )
}
