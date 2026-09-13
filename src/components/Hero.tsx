import { profile } from '../data/profile'

export default function Hero() {
  return (
    <header className="hero page" id="top">
      <div className="hero__main">
        <p className="mono hero__eyebrow">{profile.eyebrow}</p>
        <h1 className="hero__name">{profile.name}</h1>
        <p className="hero__headline">
          {profile.headlineLead}
          <br />
          <em>{profile.headlineAccent}</em>.
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
