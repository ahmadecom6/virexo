import { useEffect, useRef, useState } from 'react'
import './App.scss'

const services = [
  { number: '01', title: 'Strategic Consulting', description: 'Transform your digital vision into actionable strategies that drive measurable business results and competitive advantage.', tag: 'Strategy / Analysis' },
  { number: '02', title: 'Brand Identity Design', description: 'Create distinctive brand systems that resonate with your audience and establish lasting market presence across all touchpoints.', tag: 'Branding / Design' },
  { number: '03', title: 'Web Development', description: 'Build fast, scalable, and secure digital products that deliver exceptional user experiences and business value.', tag: 'Development / Tech' },
  { number: '04', title: 'Digital Marketing', description: 'Amplify your reach with data-driven marketing campaigns that convert prospects into loyal customers and drive growth.', tag: 'Marketing / Analytics' },
  { number: '05', title: 'Innovation Workshops', description: 'Collaborate with our team to identify opportunities, solve complex challenges, and accelerate your digital transformation journey.', tag: 'Training / Strategy' },
]

const brandLetters = 'Virexo'.split('')

function App() {
  const heroArtRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const revealItems = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.14 })

    revealItems.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const hero = document.querySelector('.hero-section')
    const heroArt = heroArtRef.current
    if (!hero || !heroArt) return undefined

    const handlePointerMove = (event) => {
      const bounds = hero.getBoundingClientRect()
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2
      heroArt.style.setProperty('--tilt-x', `${x * 7}deg`)
      heroArt.style.setProperty('--tilt-y', `${y * -7}deg`)
      heroArt.style.setProperty('--shift-x', `${x * 8}px`)
      heroArt.style.setProperty('--shift-y', `${y * 8}px`)
    }
    const resetPointer = () => {
      heroArt.style.setProperty('--tilt-x', '0deg')
      heroArt.style.setProperty('--tilt-y', '0deg')
      heroArt.style.setProperty('--shift-x', '0px')
      heroArt.style.setProperty('--shift-y', '0px')
    }

    hero.addEventListener('pointermove', handlePointerMove)
    hero.addEventListener('pointerleave', resetPointer)
    return () => {
      hero.removeEventListener('pointermove', handlePointerMove)
      hero.removeEventListener('pointerleave', resetPointer)
    }
  }, [])

  return (
    <div className="site-shell">
      <header className={`nav-wrap${menuOpen ? ' menu-open' : ''}`}>
        <a className="brand" href="#top" aria-label="Virexo Innovations - Business Website"><span className="brand-mark">V</span><span className="brand-name">{brandLetters.map((letter, index) => <span key={`${letter}-${index}`}>{letter}</span>)}</span><span className="brand-label">Innovations</span></a>
        <nav aria-label="Main navigation"><a href="#about" onClick={() => setMenuOpen(false)}>About</a><a href="#services" onClick={() => setMenuOpen(false)}>Services</a><a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a></nav>
        <a className="nav-cta" href="#contact">Start a project <span aria-hidden="true">-&gt;</span></a>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span /><span /></button>
      </header>
      <main id="top">
        <section className="hero-section"><div className="hero-copy"><p className="eyebrow"><span className="eyebrow-dot" /> Digital transformation partner / 2026</p><h1>Your vision,<br /><em>Our innovation.</em><br />Exceptional results.</h1><p className="hero-intro">Virexo Innovations transforms ambitious business ideas into powerful digital solutions. We combine strategic thinking, cutting-edge technology, and creative excellence to deliver results that matter.</p><a className="primary-button" href="#contact">Explore Our Services <span aria-hidden="true">&#8599;</span></a><div className="hero-metrics"><div><strong>150+</strong><span>Clients Served</span></div><div><strong>25+</strong><span>Years Combined Experience</span></div><div><strong>98%</strong><span>Client Retention</span></div></div></div><div className="hero-art" ref={heroArtRef} aria-hidden="true"><div className="art-ring ring-one" /><div className="art-ring ring-two" /><div className="art-core">V<span>.</span></div><p className="art-label">Progress<br />by design</p><span className="art-line line-one" /><span className="art-line line-two" /></div><div className="scroll-note"><span /> Scroll to explore</div></section>
        <section className="trust-strip reveal" aria-label="Virexo capabilities"><span>Strategy-led</span><i /> <span>Technology-enabled</span><i /> <span>Results-focused</span><i /> <span>Built to scale</span></section>
        <section className="statement-section reveal" id="about"><p className="section-index">01 / About Virexo Innovations</p><div><h2>Digital Excellence<br /><span>Built for Growth.</span></h2><p className="statement-copy">At Virexo Innovations, we're passionate about helping businesses succeed in the digital age. Our team of experienced strategists, designers, and technologists work collaboratively to understand your unique challenges and deliver solutions that drive measurable impact. We don't just build digital products—we build lasting partnerships.</p><a className="text-link" href="#contact">Start Your Transformation <span aria-hidden="true">&#8599;</span></a></div></section>
        <section className="services-section reveal" id="services"><div className="section-heading"><p className="section-index">02 / Our Services</p><h2>Comprehensive Solutions<br /><em>for Modern Business.</em></h2></div><div className="service-list">{services.map((service) => <article className="service-item reveal" key={service.number} tabIndex="0"><p className="service-number">{service.number}</p><div><h3>{service.title}</h3><p>{service.description}</p><span className="service-tag">{service.tag}</span></div><span className="service-arrow" aria-hidden="true">&#8599;</span></article>)}</div></section>
        <section className="contact-section reveal" id="contact"><p className="section-index">03 / Ready to Transform?</p><h2>Let's Build Something<br />Extraordinary <em>Together.</em></h2><p className="contact-intro">Whether you're starting a new initiative or transforming an existing one, our team is ready to help you succeed. Let's explore how Virexo Innovations can drive your business forward.</p><a className="contact-button" href="mailto:hello@virexoinnovations.com">Get In Touch <span aria-hidden="true">&#8599;</span></a></section>
      </main>
      <footer><a className="brand" href="#top"><span className="brand-mark">V</span><span className="brand-name">{brandLetters.map((letter, index) => <span key={`${letter}-${index}`}>{letter}</span>)}</span></a><p>Digital Innovation for Ambitious Businesses</p><p>© 2026 Virexo Innovations. All rights reserved.</p></footer>
    </div>
  )
}

export default App
