import React from 'react'

interface AuthPanelProps {
  mode: 'login' | 'register'
  setMode: (mode: 'login' | 'register') => void
  authFields: { name: string; email: string; password: string; passwordConfirmation: string }
  setAuthFields: (fields: { name: string; email: string; password: string; passwordConfirmation: string }) => void
  onSubmit: (event: React.FormEvent) => void
  isLoading: boolean
  error: string | null
}

export function AuthPanel({
  mode,
  setMode,
  authFields,
  setAuthFields,
  onSubmit,
  isLoading,
  error
}: AuthPanelProps) {
  return (
    <main className="auth-shell">
      <div className="auth-intro">
        <h1>it&apos;s an problem<span className="dot">.</span></h1>
        <p>Register or log in, then share your anonymous post and let others comment with their name.</p>
      </div>

      <section className="card">
        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`auth-tab${mode === 'login' ? ' active' : ''}`}
            onClick={() => setMode('login')}
          >
            <span>Sign In</span>
            <span className="tab-sub">Existing user</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            className={`auth-tab${mode === 'register' ? ' active' : ''}`}
            onClick={() => setMode('register')}
          >
            <span>Create Account</span>
            <span className="tab-sub">New user</span>
          </button>
        </div>

        <form onSubmit={onSubmit} className="stack">
          {mode === 'register' && (
            <label className="field">
              <span>Name</span>
              <input
                value={authFields.name}
                onChange={(e) => setAuthFields({ ...authFields, name: e.target.value })}
                placeholder="What should we call you?"
              />
            </label>
          )}
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={authFields.email}
              onChange={(e) => setAuthFields({ ...authFields, email: e.target.value })}
              placeholder="you@school.edu"
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={authFields.password}
              onChange={(e) => setAuthFields({ ...authFields, password: e.target.value })}
              placeholder="At least 8 characters"
              required
            />
          </label>
          {mode === 'register' && (
            <label className="field">
              <span>Confirm password</span>
              <input
                type="password"
                value={authFields.passwordConfirmation}
                onChange={(e) => setAuthFields({ ...authFields, passwordConfirmation: e.target.value })}
              />
            </label>
          )}
          {error && <div className="alert warning">{error}</div>}
          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={isLoading}
          >
            {isLoading ? 'Processing…' : (mode === 'register' ? 'Create account' : 'Sign in')}
          </button>
        </form>
      </section>

      <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--fg2)', fontSize: 13 }}>
        Your posts are anonymous by default. Comments are signed.
      </p>
    </main>
  )
}
