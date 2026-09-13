import { profile } from '../data/profile'

export default function Contact() {
  return (
    <div className="contact">
      <p className="contact__lead">
        The fastest way to reach me is email. I read everything that arrives.
      </p>
      <ul className="contact__list mono">
        <li>
          <span className="contact__label">Email</span>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </li>
        {profile.socials.map((social) => (
          <li key={social.href}>
            <span className="contact__label">{social.label}</span>
            <a href={social.href} target="_blank" rel="noopener noreferrer">
              {social.label} ↗
            </a>
          </li>
        ))}
        <li>
          <span className="contact__label">Location</span>
          <span>{profile.location}</span>
        </li>
      </ul>
    </div>
  )
}
