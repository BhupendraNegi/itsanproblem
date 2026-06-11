import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { NotificationBell } from './NotificationBell'
import { avatarHueClass } from '../avatar'
import type { User } from '../types'

interface HeaderProps {
  user: User
  onLogout: () => void
}

export function Header({ user, onLogout }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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
            <p className="app-subtitle">Anonymous problem board</p>
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
                <Link role="menuitem" to={`/users/${user.username ?? user.id}`} onClick={close}>
                  Profile
                </Link>
                {isStaff && (
                  <Link role="menuitem" to="/admin" onClick={close}>
                    Admin
                  </Link>
                )}
                <Link role="menuitem" to="/settings" onClick={close}>
                  Settings
                </Link>
                <button role="menuitem" onClick={() => { close(); onLogout() }}>
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
