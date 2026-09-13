import { profile } from '../data/profile'

export default function Footer() {
  return (
    <footer className="foot">
      <div className="page foot__inner mono">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span>Built with React, TypeScript and Vite</span>
      </div>
    </footer>
  )
}
