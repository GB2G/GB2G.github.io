import { profile } from '../data/profile'

export default function About() {
  return (
    <div className="about">
      <p className="about__body">{profile.bio}</p>
    </div>
  )
}
