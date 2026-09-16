import { useReveal } from '../hooks/useReveal'
import type { Project } from '../types'
import ProjectRow from './ProjectRow'

type Props = {
  projects: readonly Project[]
}

export default function ProjectList({ projects }: Props) {
  const { ref, isVisible } = useReveal<HTMLUListElement>()

  return (
    <ul ref={ref} className={`rows reveal-stagger${isVisible ? ' is-visible' : ''}`}>
      {projects.map((project, position) => (
        <ProjectRow key={project.id} project={project} index={position + 1} />
      ))}
    </ul>
  )
}
