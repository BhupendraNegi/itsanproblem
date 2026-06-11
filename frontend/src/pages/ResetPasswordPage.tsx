import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import * as api from '../api'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await api.resetPassword({ token, password, passwordConfirmation })
      setDone(true)
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiError = err as any
      setError(apiError?.response?.data?.error || apiError?.response?.data?.errors?.join(', ') || 'Reset failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-intro">
        <h1>Set a new password<span className="dot">.</span></h1>
        <p>Pick a new password for your account.</p>
      </div>

      <section className="card">
        {done ? (
          <div className="alert success">Password updated — taking you to sign in…</div>
        ) : (
          <form onSubmit={handleSubmit} className="stack">
            {!token && <div className="alert warning">This link is missing its token — use the link from the email.</div>}
            {error && <div className="alert danger">{error}</div>}
            <label className="field">
              <span>New password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
            </label>
            <label className="field">
              <span>Confirm new password</span>
              <input type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required autoComplete="new-password" />
            </label>
            <button type="submit" className="btn-primary auth-submit" disabled={busy || !token}>
              {busy ? 'Saving…' : 'Set new password'}
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
