import { useTypewriter } from '../hooks/useTypewriter'
import { profile } from '../data/profile'

export default function Hero() {
  const accent = useTypewriter(profile.headlineAccents)

  return (
    <header className="hero page" id="top">
      <div className="hero__main">
        <p className="mono hero__eyebrow">{profile.eyebrow}</p>
        <h1 className="hero__name">{profile.name}</h1>
        <p className="hero__headline">
          {profile.headlineLead}
          <br />
          <em className="hero__cycle" aria-hidden="true">
            {accent}
            <span className="hero__cursor" />
          </em>
          <span className="visually-hidden">{profile.headlineAccents[0] ?? ''}</span>.
        </p>
      </div>
      <dl className="hero__meta mono">
        <dt>Currently</dt>
        <dd>{profile.currently}</dd>
        <dt>Open to</dt>
        <dd>{profile.availability}</dd>
      </dl>
    </header>
  )
}
