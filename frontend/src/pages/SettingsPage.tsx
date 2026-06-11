import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '../components/Header'
import { useProfileMutation, usePasswordMutation, useUserProfile } from '../hooks/useMutations'
import * as api from '../api'
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
  const { data: profile } = useUserProfile(currentUser.username ?? String(currentUser.id))

  const [name, setName] = useState(currentUser.name)
  const [username, setUsername] = useState<string | null>(null)
  const [email, setEmail] = useState(currentUser.email)
  const [bio, setBio] = useState<string | null>(null)
  const [profileStatus, setProfileStatus] = useState<{ kind: 'success' | 'danger'; text: string } | null>(null)

  const [digestPref, setDigestPref] = useState<boolean | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [passwordStatus, setPasswordStatus] = useState<{ kind: 'success' | 'danger'; text: string } | null>(null)

  const [deletePassword, setDeletePassword] = useState('')
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const profileMutation = useProfileMutation()
  const passwordMutation = usePasswordMutation()

  async function handleDeleteAccount(event: React.FormEvent) {
    event.preventDefault()
    if (!window.confirm('Delete your account and all your posts? This cannot be undone.')) return
    setDeleting(true)
    setDeleteStatus(null)
    try {
      await api.deleteAccount(deletePassword)
      onLogout()
    } catch (err) {
      setDeleteStatus(errorMessage(err, 'Failed to delete account'))
      setDeleting(false)
    }
  }

  // Bio, username, and digest preference come from the profile API, not the
  // auth store; prefill once loaded.
  const bioValue = bio ?? profile?.bio ?? ''
  const usernameValue = username ?? profile?.username ?? currentUser.username ?? ''
  const digestEnabled = digestPref ?? profile?.email_digest_enabled ?? true

  function handleDigestToggle() {
    const next = !digestEnabled
    setDigestPref(next)
    profileMutation.mutate({ email_digest_enabled: next }, {
      onError: () => setDigestPref(!next),
    })
  }

  function handleProfileSubmit(event: React.FormEvent) {
    event.preventDefault()
    profileMutation.mutate(
      { name: name.trim(), username: usernameValue.trim(), email: email.trim(), bio: bioValue.trim() },
      {
        onSuccess: (updated) => {
          // Spread currentUser so fields not in the response (role) survive.
          if (token) login({ ...currentUser, name: updated.name, username: updated.username, email: updated.email }, token)
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
      <main className="app-shell">
        <Link to="/" className="btn-ghost back-link">
          <img src="/assets/icons/arrow-right.svg" alt="" />
          Back to feed
        </Link>

        <h1 className="page-title">Settings</h1>

        {/* Profile */}
        <section className="card settings-card">
          <h2 className="section-title">Profile</h2>
          {profileStatus && <div className={`alert ${profileStatus.kind}`}>{profileStatus.text}</div>}
          <form onSubmit={handleProfileSubmit} className="settings-form">
            <label className="field">
              <span>Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="field">
              <span>Username</span>
              <input
                value={usernameValue}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="lowercase letters, numbers, underscores"
                required
              />
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
                maxLength={300}
                rows={2}
              />
            </label>
            <button type="submit" className="btn-primary" disabled={profileMutation.isPending}>
              {profileMutation.isPending ? 'Saving…' : 'Save profile'}
            </button>
          </form>
        </section>

        {/* Password */}
        <section className="card settings-card">
          <h2 className="section-title">Password</h2>
          {passwordStatus && <div className={`alert ${passwordStatus.kind}`}>{passwordStatus.text}</div>}
          <form onSubmit={handlePasswordSubmit} className="settings-form">
            <label className="field">
              <span>Current password</span>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required autoComplete="current-password" />
            </label>
            <label className="field">
              <span>New password <span className="char-count">min 8 characters</span></span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required autoComplete="new-password" />
            </label>
            <label className="field">
              <span>Confirm new password</span>
              <input type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required autoComplete="new-password" />
            </label>
            <button type="submit" className="btn-primary" disabled={passwordMutation.isPending}>
              {passwordMutation.isPending ? 'Changing…' : 'Change password'}
            </button>
          </form>
        </section>

        {/* Notifications */}
        <section className="card settings-card">
          <h2 className="section-title">Notifications</h2>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={digestEnabled}
              onChange={handleDigestToggle}
              disabled={profileMutation.isPending}
            />
            Email me a daily digest
          </label>
          <p className="section-hint">
            One email a day with new replies to your posts and helpful marks on your replies —
            it's the only way back to your anonymous posts when you're away.
          </p>
        </section>

        {/* Appearance */}
        <section className="card settings-card">
          <h2 className="section-title">Appearance</h2>
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
          <p className="section-hint">
            System follows your OS appearance; Light and Dark override it.
          </p>
        </section>

        {/* Danger zone */}
        <section className="card settings-card danger-zone">
          <h2 className="section-title">Delete account</h2>
          <p className="section-hint">
            Deletes your account, your anonymous posts, and your replies. This cannot be undone.
          </p>
          {deleteStatus && <div className="alert danger">{deleteStatus}</div>}
          <form onSubmit={handleDeleteAccount} className="settings-form">
            <label className="field">
              <span>Confirm with your password</span>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </label>
            <button type="submit" className="btn-danger" disabled={deleting || !deletePassword}>
              {deleting ? 'Deleting…' : 'Delete my account'}
            </button>
          </form>
        </section>
      </main>
    </>
  )
}
