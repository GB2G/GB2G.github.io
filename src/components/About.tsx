import { useReveal } from '../hooks/useReveal'
import { profile } from '../data/profile'

export default function About() {
  const { ref, isVisible } = useReveal<HTMLDivElement>()

  return (
    <div ref={ref} className={`about reveal${isVisible ? ' is-visible' : ''}`}>
      <p className="about__body">{profile.bio}</p>
    </div>
  )
}
