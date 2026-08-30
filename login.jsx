import { createRoot } from 'react-dom/client'
import { useEffect, useState } from 'react'
import './Login.scss'

const tokenKey = 'virexo-client-portal-token'

function Portal() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [account, setAccount] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const token = window.localStorage.getItem(tokenKey)
    if (!token) {
      setLoading(false)
      return
    }
    fetch('/api/auth/session', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => setAccount(data))
      .catch(() => window.localStorage.removeItem(tokenKey))
      .finally(() => setLoading(false))
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json().catch(() => ({}))
      if (response.status === 502) throw new Error('The portal service is unavailable. Please try again in a moment.')
      if (!response.ok) throw new Error(data.error || 'Unable to sign in.')
      window.localStorage.setItem(tokenKey, data.token)
      setAccount({ email: data.email })
      setPassword('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  const signOut = async () => {
    const token = window.localStorage.getItem(tokenKey)
    await fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {})
    window.localStorage.removeItem(tokenKey)
    setAccount(null)
    setEmail('')
  }

  return <main className="portal-shell"><a className="portal-brand" href="/"><span>V</span>Virexo <small>Innovations</small></a><section className="portal-card">{loading ? <p className="portal-loading">Checking your secure session...</p> : account ? <div className="portal-welcome"><p className="portal-eyebrow">Client portal</p><h1>Welcome back.</h1><p>Signed in as <strong>{account.email}</strong></p><div className="portal-links"><a href="https://virexo.odoo.com" target="_blank" rel="noreferrer">Visit Virexo website <span>↗</span></a><a href="mailto:virexoinnovations@gmail.com">Contact Virexo <span>↗</span></a></div><button type="button" className="signout-button" onClick={signOut}>Sign out</button></div> : <><div className="portal-intro"><p className="portal-eyebrow">Secure client access</p><h1>Build what's next.</h1><p>Sign in to access your Virexo Innovations workspace.</p></div><form onSubmit={submit}><label htmlFor="portal-email">Email address</label><input id="portal-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required /><label htmlFor="portal-password">Password</label><input id="portal-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required />{error && <p className="portal-error" role="alert">{error}</p>}<button type="submit" disabled={submitting}>{submitting ? 'Signing in...' : 'Sign in'} <span>↗</span></button></form><p className="portal-help">Need access? <a href="mailto:virexoinnovations@gmail.com">Contact Virexo</a></p></>}</section><p className="portal-footer">Virexo Innovations · Digital transformation partner</p></main>
}

createRoot(document.getElementById('root')).render(<Portal />)
