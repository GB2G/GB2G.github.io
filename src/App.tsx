import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Hero from './components/Hero'
import Nav from './components/Nav'
import ProjectList from './components/ProjectList'
import SectionHead from './components/SectionHead'
import StackStrip from './components/StackStrip'
import { projects } from './data/projects'

const featured = projects.filter((project) => project.featured)
const earlier = projects.filter((project) => !project.featured)

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <Nav />
      <Hero />
      <StackStrip />

      <main id="main">
        <section id="work" className="page" aria-labelledby="work-heading">
          <SectionHead
            index="01"
            title="Selected work"
            count={featured.length}
            headingId="work-heading"
          />
          <ProjectList projects={featured} />
        </section>

        <section id="earlier" className="page" aria-labelledby="earlier-heading">
          <SectionHead
            index="02"
            title="Earlier work"
            count={earlier.length}
            headingId="earlier-heading"
          />
          <ProjectList projects={earlier} />
        </section>

        <section id="about" className="page" aria-labelledby="about-heading">
          <SectionHead index="03" title="About" count={0} headingId="about-heading" />
          <About />
        </section>

        <section id="contact" className="page" aria-labelledby="contact-heading">
          <SectionHead index="04" title="Contact" count={0} headingId="contact-heading" />
          <Contact />
        </section>
      </main>

      <Footer />
    </>
  )
}
