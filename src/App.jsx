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

function ChatAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hi, I am the Virexo assistant. How can we help with your project?' }])
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const content = input.trim()
    if (!content || loading) return
    const nextMessages = [...messages, { role: 'user', content }]
    setMessages(nextMessages)
    setInput('')
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: nextMessages }) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Unable to reach the assistant.')
      setMessages((currentMessages) => [...currentMessages, { role: 'assistant', content: data.message }])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return <><button className="chat-launcher" type="button" onClick={() => setOpen((isOpen) => !isOpen)} aria-label={open ? 'Close AI assistant' : 'Open AI assistant'} aria-expanded={open}>AI</button>{open && <aside className="chat-panel" aria-label="Virexo AI assistant"><div className="chat-header"><div><strong>Virexo AI</strong><span>Project assistant</span></div><button type="button" onClick={() => setOpen(false)} aria-label="Close AI assistant">×</button></div><div className="chat-messages" aria-live="polite">{messages.map((message, index) => <p className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>{message.content}</p>)}{loading && <p className="chat-message assistant">Thinking...</p>}</div>{error && <p className="chat-error" role="alert">{error}</p>}<form className="chat-form" onSubmit={handleSubmit}><label className="sr-only" htmlFor="chat-message">Ask Virexo AI</label><input id="chat-message" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about your project" maxLength="1000" disabled={loading} /><button type="submit" disabled={loading || !input.trim()} aria-label="Send message">↑</button></form></aside>}</>
}

function App() {
  const heroArtRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => window.localStorage.getItem('virexo-theme') === 'dark')
  const [formSubmitted, setFormSubmitted] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light'
    window.localStorage.setItem('virexo-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

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
    <>
    <div className="site-shell">
      <header className={`nav-wrap${menuOpen ? ' menu-open' : ''}`}>
        <a className="brand" href="#top" aria-label="Virexo Innovations - Business Website"><span className="brand-mark">V</span><span className="brand-name">{brandLetters.map((letter, index) => <span key={`${letter}-${index}`}>{letter}</span>)}</span><span className="brand-label">Innovations</span></a>
        <nav aria-label="Main navigation"><a href="#about" onClick={() => setMenuOpen(false)}>About</a><a href="#services" onClick={() => setMenuOpen(false)}>Services</a><a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a></nav>
        <a className="nav-cta" href="#contact">Start a project <span aria-hidden="true">-&gt;</span></a>
        <button className="theme-toggle" type="button" aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} aria-pressed={darkMode} onClick={() => setDarkMode((mode) => !mode)}><span aria-hidden="true">{darkMode ? '☀' : '☾'}</span></button>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span /><span /></button>
      </header>
      <main id="top">
        <section className="hero-section"><div className="hero-copy"><p className="eyebrow"><span className="eyebrow-dot" /> Digital transformation partner / 2026</p><h1>Your vision,<br /><em>Our innovation.</em><br />Exceptional results.</h1><p className="hero-intro">Virexo Innovations transforms ambitious business ideas into powerful digital solutions. We combine strategic thinking, cutting-edge technology, and creative excellence to deliver results that matter.</p><a className="primary-button" href="#contact">Explore Our Services <span aria-hidden="true">&#8599;</span></a><div className="hero-metrics"><div><strong>150+</strong><span>Clients Served</span></div><div><strong>25+</strong><span>Years Combined Experience</span></div><div><strong>98%</strong><span>Client Retention</span></div></div></div><div className="hero-art" ref={heroArtRef} aria-hidden="true"><div className="art-ring ring-one" /><div className="art-ring ring-two" /><div className="art-core">V<span>.</span></div><p className="art-label">Progress<br />by design</p><span className="art-line line-one" /><span className="art-line line-two" /></div><div className="scroll-note"><span /> Scroll to explore</div></section>
        <section className="trust-strip reveal" aria-label="Virexo capabilities"><span>Strategy-led</span><i /> <span>Technology-enabled</span><i /> <span>Results-focused</span><i /> <span>Built to scale</span></section>
        <section className="statement-section reveal" id="about"><p className="section-index">01 / About Virexo Innovations</p><div><h2>Digital Excellence<br /><span>Built for Growth.</span></h2><p className="statement-copy">At Virexo Innovations, we're passionate about helping businesses succeed in the digital age. Our team of experienced strategists, designers, and technologists work collaboratively to understand your unique challenges and deliver solutions that drive measurable impact. We don't just build digital products—we build lasting partnerships.</p><a className="text-link" href="#contact">Start Your Transformation <span aria-hidden="true">&#8599;</span></a></div></section>
        <section className="services-section reveal" id="services"><div className="section-heading"><p className="section-index">02 / Our Services</p><h2>Comprehensive Solutions<br /><em>for Modern Business.</em></h2></div><div className="service-list">{services.map((service) => <article className="service-item reveal" key={service.number} tabIndex="0"><p className="service-number">{service.number}</p><div><h3>{service.title}</h3><p>{service.description}</p><span className="service-tag">{service.tag}</span></div><span className="service-arrow" aria-hidden="true">&#8599;</span></article>)}</div></section>
        <section className="contact-section reveal" id="contact"><div className="contact-content"><p className="section-index">03 / Start a project</p><h2>Ready to build something<br />your customers actually <em>trust?</em></h2><p className="contact-intro">Share a few details about your project and a member of the Virexo Innovations team will reply within one business day with a clear next step.</p><div className="contact-details"><a href="mailto:hello@virexoinnovations.com"><span>Email</span><strong>hello@virexoinnovations.com</strong></a><a href="tel:+15550192044"><span>Phone</span><strong>+1 (555) 019-2044</strong></a><div><span>Studio hours</span><strong>Mon-Fri, 9am-6pm</strong></div></div></div>{formSubmitted ? <div className="contact-form form-success" role="status"><span className="success-icon" aria-hidden="true">&#10003;</span><h3>Message received.</h3><p>Thank you for reaching out. Our team will reply within one business day.</p><button className="text-link" type="button" onClick={() => setFormSubmitted(false)}>Send another message <span aria-hidden="true">&#8599;</span></button></div> : <form className="contact-form" onSubmit={(event) => { event.preventDefault(); setFormSubmitted(true); event.currentTarget.reset() }}><label htmlFor="name">Full name</label><input id="name" name="name" type="text" placeholder="Your full name" autoComplete="name" required /><label htmlFor="email">Email address</label><input id="email" name="email" type="email" placeholder="you@company.com" autoComplete="email" required /><label htmlFor="details">Project details</label><textarea id="details" name="details" placeholder="What are you looking to build?" rows="5" required /><button className="contact-button" type="submit">Send message <span aria-hidden="true">&#8599;</span></button></form>}</section>
      </main>
      <footer><a className="brand" href="#top"><span className="brand-mark">V</span><span className="brand-name">{brandLetters.map((letter, index) => <span key={`${letter}-${index}`}>{letter}</span>)}</span></a><p>Digital Innovation for Ambitious Businesses</p><p>© 2026 Virexo Innovations. All rights reserved.</p><div className="social-links" aria-label="Virexo Innovations social links"><a href="https://github.com/ahmadecom6/virexo" target="_blank" rel="noreferrer" aria-label="Virexo Innovations GitHub repository" title="GitHub"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" fillRule="evenodd" d="M12 2.5a9.5 9.5 0 0 0-3 18.51c.48.09.66-.21.66-.46v-1.68c-2.69.59-3.26-1.15-3.26-1.15-.44-1.12-1.07-1.42-1.07-1.42-.88-.61.07-.6.07-.6.97.07 1.48 1 1.48 1 .86 1.47 2.27 1.05 2.82.8.09-.62.34-1.05.62-1.29-2.15-.24-4.41-1.08-4.41-4.79 0-1.06.38-1.92 1-2.6-.1-.24-.43-1.23.1-2.56 0 0 .81-.26 2.63 1a9.1 9.1 0 0 1 4.8 0c1.82-1.26 2.63-1 2.63-1 .53 1.33.2 2.32.1 2.56.62.68 1 1.54 1 2.6 0 3.72-2.27 4.55-4.43 4.78.35.3.66.9.66 1.82v2.7c0 .25.18.55.67.46A9.5 9.5 0 0 0 12 2.5Z" clipRule="evenodd" /></svg></a><a href="https://www.linkedin.com/in/ahmad-asif-4b75383ba?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noreferrer" aria-label="Ahmad Asif LinkedIn profile" title="LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5.2 7.2A1.7 1.7 0 1 1 5.2 3.8a1.7 1.7 0 0 1 0 3.4ZM3.8 20.2h2.8V9.1H3.8v11.1ZM8.5 9.1h2.7v1.5h.04c.38-.72 1.3-1.86 3.26-1.86 3.49 0 4.13 2.3 4.13 5.28v6.17h-2.8v-5.47c0-1.31-.02-3-1.83-3-1.83 0-2.11 1.43-2.11 2.91v5.56H8.5V9.1Z" /></svg></a></div></footer>
    </div>
    <ChatAssistant />
    </>
  )
}

export default App
