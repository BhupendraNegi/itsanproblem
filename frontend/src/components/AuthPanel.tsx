import React from 'react'
import { Link } from 'react-router-dom'
import { PasswordInput } from './PasswordInput'

interface AuthPanelProps {
  mode: 'login' | 'register'
  setMode: (mode: 'login' | 'register') => void
  authFields: { name: string; username: string; email: string; password: string; passwordConfirmation: string }
  setAuthFields: (fields: { name: string; username: string; email: string; password: string; passwordConfirmation: string }) => void
  onSubmit: (event: React.FormEvent) => void
  isLoading: boolean
  error: string | null
  // false on the /admin route: sign-in only, no account creation
  allowRegister?: boolean
}

export function AuthPanel({
  mode,
  setMode,
  authFields,
  setAuthFields,
  onSubmit,
  isLoading,
  error,
  allowRegister = true
}: AuthPanelProps) {
  return (
    <main className="auth-shell">
      <div className="auth-intro">
        <h1>it&apos;s an problem<span className="dot">.</span></h1>
        <p>
          {allowRegister
            ? 'Share what\u2019s bothering you — with your name, or fully anonymously when it matters. Honest replies from real people.'
            : 'Sign in to continue. Accounts can’t be created from here.'}
        </p>
      </div>

      <section className="card">
        {allowRegister ? (
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
        ) : (
          <div className="auth-tabs">
            <span className="auth-tab active is-static">
              <span>Sign In</span>
            </span>
          </div>
        )}

        <form onSubmit={onSubmit} className="stack">
          {mode === 'register' && (
            <>
              <label className="field">
                <span>Name</span>
                <input
                  value={authFields.name}
                  onChange={(e) => setAuthFields({ ...authFields, name: e.target.value })}
                  placeholder="What should we call you?"
                />
              </label>
              <label className="field">
                <span>Username</span>
                <input
                  value={authFields.username}
                  onChange={(e) => setAuthFields({ ...authFields, username: e.target.value })}
                  placeholder="Optional — we'll make one from your name"
                />
              </label>
            </>
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
            <span>
              Password
              {mode === 'register' && <span className="char-count">min 8 characters</span>}
            </span>
            <PasswordInput
              value={authFields.password}
              onChange={(password) => setAuthFields({ ...authFields, password })}
              placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'}
              minLength={mode === 'register' ? 8 : undefined}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              required
            />
          </label>
          {mode === 'register' && (
            <label className="field">
              <span>Confirm password</span>
              <PasswordInput
                value={authFields.passwordConfirmation}
                onChange={(passwordConfirmation) => setAuthFields({ ...authFields, passwordConfirmation })}
                autoComplete="new-password"
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
          {mode === 'login' && (
            <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
          )}
        </form>
      </section>

      <p className="auth-footnote">
        You choose per post and per reply: your name, or full anonymity — no name, no handle, no trace.
      </p>
    </main>
  )
}
