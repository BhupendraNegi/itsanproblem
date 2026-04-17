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
    <main className="app-shell">
      <section className="auth-panel">
        <div className="head-row">
          <div>
            <h1>It&apos;s A Problem</h1>
            <p>Register or log in, then share your anonymous post and let others comment with their name.</p>
          </div>
        </div>

        <div className="auth-buttons-row">
          <button 
            className={`auth-btn ${mode === 'login' ? 'active' : ''}`} 
            onClick={() => setMode('login')}
          >
            <span className="btn-title">Sign In</span>
            <span className="btn-subtitle">Existing user</span>
          </button>
          <button 
            className={`auth-btn ${mode === 'register' ? 'active' : ''}`} 
            onClick={() => setMode('register')}
          >
            <span className="btn-title">Create Account</span>
            <span className="btn-subtitle">New user</span>
          </button>
        </div>

        <form className="form-card" onSubmit={onSubmit}>
          {mode === 'register' && (
            <label>
              Name
              <input
                value={authFields.name}
                onChange={(event) => setAuthFields({ ...authFields, name: event.target.value })}
                required
              />
            </label>
          )}
          <label>
            Email
            <input
              type="email"
              value={authFields.email}
              onChange={(event) => setAuthFields({ ...authFields, email: event.target.value })}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={authFields.password}
              onChange={(event) => setAuthFields({ ...authFields, password: event.target.value })}
              required
            />
          </label>
          {mode === 'register' && (
            <label>
              Confirm Password
              <input
                type="password"
                value={authFields.passwordConfirmation}
                onChange={(event) => setAuthFields({ ...authFields, passwordConfirmation: event.target.value })}
                required
              />
            </label>
          )}
          {error && <p className="alert">{error}</p>}
          <button type="submit" className="primary-button" disabled={isLoading}>
            {isLoading ? 'Processing...' : (mode === 'register' ? 'Create Account' : 'Sign In')}
          </button>
        </form>
      </section>
    </main>
  )
}
