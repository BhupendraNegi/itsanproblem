import { useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../api'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    try {
      await api.requestPasswordReset(email.trim())
    } finally {
      // same outcome either way — the API never reveals whether the email exists
      setSent(true)
      setBusy(false)
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-intro">
        <h1>Forgot password<span className="dot">?</span></h1>
        <p>Enter your email and we'll send a reset link if an account exists.</p>
      </div>

      <section className="card">
        {sent ? (
          <div className="alert success">
            If that email has an account, a reset link is on its way. Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="stack">
            <label className="field">
              <span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <button type="submit" className="btn-primary auth-submit" disabled={busy}>
              {busy ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}
      </section>

      <p className="auth-footnote">
        <Link to="/">Back to sign in</Link>
      </p>
    </main>
  )
}
