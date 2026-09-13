import type { Project } from '../types'
import ProjectRow from './ProjectRow'

type Props = {
  projects: readonly Project[]
}

export default function ProjectList({ projects }: Props) {
  return (
    <ul className="rows">
      {projects.map((project, position) => (
        <ProjectRow key={project.id} project={project} index={position + 1} />
      ))}
    </ul>
  )
}
