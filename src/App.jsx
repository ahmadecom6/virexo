import { useEffect, useRef, useState } from 'react'
import './App.scss'

const services = [
  { number: '01', title: 'Brand systems', description: 'Distinctive identities that make your next chapter impossible to miss.', tag: 'Strategy / Identity' },
  { number: '02', title: 'Digital products', description: 'Useful, beautiful digital experiences that turn first visits into habits.', tag: 'UX / UI / Build' },
  { number: '03', title: 'Growth design', description: 'Sharp creative direction for launches, campaigns, and everything after.', tag: 'Campaigns / Content' },
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
        <a className="brand" href="#top" aria-label="Virexo home"><span className="brand-mark">V</span><span className="brand-name">{brandLetters.map((letter, index) => <span key={`${letter}-${index}`}>{letter}</span>)}</span></a>
        <nav aria-label="Main navigation"><a href="#about" onClick={() => setMenuOpen(false)}>About</a><a href="#services" onClick={() => setMenuOpen(false)}>Services</a><a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a></nav>
        <a className="nav-cta" href="#contact">Start a project <span aria-hidden="true">-&gt;</span></a>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span /><span /></button>
      </header>
      <main id="top">
        <section className="hero-section"><div className="hero-copy"><p className="eyebrow"><span className="eyebrow-dot" /> Digital transformation partner / 2026</p><h1>Think big.<br /><em>Move fast.</em><br />Grow bold.</h1><p className="hero-intro">Virexo turns complex digital challenges into clear moves, sharper experiences, and businesses built for what is next.</p><a className="primary-button" href="#contact">Start your next chapter <span aria-hidden="true">&#8599;</span></a><div className="hero-metrics"><div><strong>50+</strong><span>Projects shipped</span></div><div><strong>12</strong><span>Markets reached</span></div><div><strong>4.9</strong><span>Client rating</span></div></div></div><div className="hero-art" ref={heroArtRef} aria-hidden="true"><div className="art-ring ring-one" /><div className="art-ring ring-two" /><div className="art-core">V<span>.</span></div><p className="art-label">Progress<br />by design</p><span className="art-line line-one" /><span className="art-line line-two" /></div><div className="scroll-note"><span /> Scroll to explore</div></section>
        <section className="trust-strip reveal" aria-label="Virexo capabilities"><span>Strategy-led</span><i /> <span>Technology-enabled</span><i /> <span>Results-focused</span><i /> <span>Built to scale</span></section>
        <section className="statement-section reveal" id="about"><p className="section-index">01 / About Virexo</p><div><h2>Make noise today.<br /><span>Make impact tomorrow.</span></h2><p className="statement-copy">We help ambitious teams cut through the noise. Strategy, design, and technology come together to create digital experiences people remember and businesses can build on.</p><a className="text-link" href="#contact">See how we work <span aria-hidden="true">&#8599;</span></a></div></section>
        <section className="services-section reveal" id="services"><div className="section-heading"><p className="section-index">02 / What we do</p><h2>Make it<br /><em>matter.</em></h2></div><div className="service-list">{services.map((service) => <article className="service-item reveal" key={service.number} tabIndex="0"><p className="service-number">{service.number}</p><div><h3>{service.title}</h3><p>{service.description}</p><span className="service-tag">{service.tag}</span></div><span className="service-arrow" aria-hidden="true">&#8599;</span></article>)}</div></section>
        <section className="contact-section reveal" id="contact"><p className="section-index">03 / Your next chapter</p><h2>Have a good feeling<br />about <em>what's next?</em></h2><a className="contact-button" href="mailto:hello@virexo.studio">Let's talk <span aria-hidden="true">&#8599;</span></a></section>
      </main>
      <footer><a className="brand" href="#top"><span className="brand-mark">V</span><span className="brand-name">{brandLetters.map((letter, index) => <span key={`${letter}-${index}`}>{letter}</span>)}</span></a><p>Digital businesses, made remarkable.</p><p>© 2024 Virexo Studio</p></footer>
    </div>
  )
}

export default App
