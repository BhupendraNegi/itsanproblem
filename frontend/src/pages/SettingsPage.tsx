import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '../components/Header'
import { useProfileMutation, usePasswordMutation, useUserProfile } from '../hooks/useMutations'
import useAuth, { useTheme, type ThemePref } from '../store'
import type { User } from '../types'

interface SettingsPageProps {
  currentUser: User
  onLogout: () => void
}

const THEME_OPTIONS: { value: ThemePref; label: string; description: string }[] = [
  { value: 'light', label: 'Light', description: 'Always light' },
  { value: 'dark', label: 'Dark', description: 'Always dark' },
  { value: 'system', label: 'System', description: 'Follow your OS setting' },
]

function errorMessage(error: unknown, fallback: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiError = error as any
  return apiError?.response?.data?.error || apiError?.response?.data?.errors?.join(', ') || fallback
}

export function SettingsPage({ currentUser, onLogout }: SettingsPageProps) {
  const { token, login } = useAuth()
  const { pref, setPref } = useTheme()
  const { data: profile } = useUserProfile(currentUser.id)

  const [name, setName] = useState(currentUser.name)
  const [email, setEmail] = useState(currentUser.email)
  const [bio, setBio] = useState<string | null>(null)
  const [profileStatus, setProfileStatus] = useState<{ kind: 'success' | 'danger'; text: string } | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [passwordStatus, setPasswordStatus] = useState<{ kind: 'success' | 'danger'; text: string } | null>(null)

  const profileMutation = useProfileMutation()
  const passwordMutation = usePasswordMutation()

  // Bio comes from the profile API, not the auth store; prefill once loaded.
  const bioValue = bio ?? profile?.bio ?? ''

  function handleProfileSubmit(event: React.FormEvent) {
    event.preventDefault()
    profileMutation.mutate(
      { name: name.trim(), email: email.trim(), bio: bioValue.trim() },
      {
        onSuccess: (updated) => {
          if (token) login({ id: updated.id, name: updated.name, email: updated.email }, token)
          setProfileStatus({ kind: 'success', text: 'Profile updated' })
        },
        onError: (error) => setProfileStatus({ kind: 'danger', text: errorMessage(error, 'Failed to update profile') }),
      }
    )
  }

  function handlePasswordSubmit(event: React.FormEvent) {
    event.preventDefault()
    passwordMutation.mutate(
      { currentPassword, password, passwordConfirmation },
      {
        onSuccess: () => {
          setPasswordStatus({ kind: 'success', text: 'Password changed' })
          setCurrentPassword('')
          setPassword('')
          setPasswordConfirmation('')
        },
        onError: (error) => setPasswordStatus({ kind: 'danger', text: errorMessage(error, 'Failed to change password') }),
      }
    )
  }

  return (
    <>
      <Header user={currentUser} onLogout={onLogout} />
      <main className="app-shell" style={{ maxWidth: 720 }}>
        <Link to="/" className="btn-ghost" style={{ width: 'fit-content', paddingLeft: 0 }}>
          <img src="/assets/icons/arrow-right.svg" alt="" style={{ width: 16, height: 16, transform: 'rotate(180deg)' }} />
          Back to feed
        </Link>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.015em', margin: 0 }}>
          Settings
        </h1>

        {/* Profile */}
        <section className="card" style={{ display: 'grid', gap: 14 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: 0 }}>Profile</h2>
          {profileStatus && <div className={`alert ${profileStatus.kind}`}>{profileStatus.text}</div>}
          <form onSubmit={handleProfileSubmit} style={{ display: 'grid', gap: 12 }}>
            <label className="field">
              <span>Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="field">
              <span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label className="field">
              <span>Bio</span>
              <textarea
                value={bioValue}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A line about you, shown on your profile"
                rows={2}
              />
            </label>
            <button type="submit" className="btn-primary" style={{ width: 'fit-content' }} disabled={profileMutation.isPending}>
              {profileMutation.isPending ? 'Saving…' : 'Save profile'}
            </button>
          </form>
        </section>

        {/* Password */}
        <section className="card" style={{ display: 'grid', gap: 14 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: 0 }}>Password</h2>
          {passwordStatus && <div className={`alert ${passwordStatus.kind}`}>{passwordStatus.text}</div>}
          <form onSubmit={handlePasswordSubmit} style={{ display: 'grid', gap: 12 }}>
            <label className="field">
              <span>Current password</span>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required autoComplete="current-password" />
            </label>
            <label className="field">
              <span>New password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
            </label>
            <label className="field">
              <span>Confirm new password</span>
              <input type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required autoComplete="new-password" />
            </label>
            <button type="submit" className="btn-primary" style={{ width: 'fit-content' }} disabled={passwordMutation.isPending}>
              {passwordMutation.isPending ? 'Changing…' : 'Change password'}
            </button>
          </form>
        </section>

        {/* Appearance */}
        <section className="card" style={{ display: 'grid', gap: 14 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: 0 }}>Appearance</h2>
          <div className="segmented" role="radiogroup" aria-label="Theme">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.value}
                role="radio"
                aria-checked={pref === option.value}
                className={pref === option.value ? 'is-active' : ''}
                onClick={() => setPref(option.value)}
                title={option.description}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--fg2)' }}>
            System follows your OS appearance; Light and Dark override it.
          </p>
        </section>
      </main>
    </>
  )
}
