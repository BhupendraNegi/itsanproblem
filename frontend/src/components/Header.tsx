import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { NotificationBell } from './NotificationBell'
import { avatarHueClass } from '../avatar'
import { useTheme, type ThemePref } from '../store'
import type { User } from '../types'

const THEME_OPTIONS: { value: ThemePref; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Auto' },
]

interface HeaderProps {
  user: User
  onLogout: () => void
}

export function Header({ user, onLogout }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { pref, setPref } = useTheme()

  useEffect(() => {
    if (!menuOpen) return
    function onClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [menuOpen])

  const isStaff = user.role === 'admin' || user.role === 'moderator'
  const close = () => setMenuOpen(false)

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <img src="/assets/logo-iap-mark.svg" alt="" />
          <div>
            <h1 className="app-title">it&apos;s an problem<span className="dot">.</span></h1>
            <p className="app-subtitle">Real problems, honest advice</p>
          </div>
        </div>

        <div className="navbar-user">
          <NotificationBell />
          <div className="user-menu" ref={menuRef}>
            <button
              className="user-pill"
              onClick={() => setMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <span className="user-name">{user.name}</span>
              <span className={`user-avatar ${avatarHueClass(user.username ?? user.name)}`}>{user.name.charAt(0).toUpperCase()}</span>
              <span className="user-caret" aria-hidden>▾</span>
            </button>
            {menuOpen && (
              <nav className="user-menu-dropdown" role="menu">
                {/* stays open on theme change so the switch is visible */}
                <div className="menu-theme-row" role="none">
                  <span>Theme</span>
                  <div className="segmented mini" role="radiogroup" aria-label="Theme">
                    {THEME_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        role="radio"
                        aria-checked={pref === option.value}
                        className={pref === option.value ? 'is-active' : ''}
                        onClick={() => setPref(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <Link role="menuitem" to={`/users/${user.username ?? user.id}`} onClick={close}>
                  <img src="/assets/icons/user.svg" alt="" className="menu-icon" />
                  Profile
                </Link>
                {isStaff && (
                  <Link role="menuitem" to="/admin" onClick={close}>
                    <img src="/assets/icons/users.svg" alt="" className="menu-icon" />
                    Admin
                  </Link>
                )}
                <Link role="menuitem" to="/settings" onClick={close}>
                  <img src="/assets/icons/settings.svg" alt="" className="menu-icon" />
                  Settings
                </Link>
                <Link role="menuitem" to="/faq" onClick={close}>
                  <img src="/assets/icons/help-circle.svg" alt="" className="menu-icon" />
                  FAQ
                </Link>
                <button role="menuitem" onClick={() => { close(); onLogout() }}>
                  <img src="/assets/icons/log-out.svg" alt="" className="menu-icon" />
                  Log out
                </button>
              </nav>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
