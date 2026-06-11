import { Link } from 'react-router-dom'
import { NotificationBell } from './NotificationBell'
import type { User } from '../types'

interface HeaderProps {
  user: User
  onLogout: () => void
}

export function Header({ user, onLogout }: HeaderProps) {
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
          {(user.role === 'admin' || user.role === 'moderator') && (
            <Link to="/admin" className="logout-icon-btn" title="Admin" aria-label="Admin">
              <img src="/assets/icons/users.svg" alt="" />
            </Link>
          )}
          <Link to="/settings" className="logout-icon-btn" title="Settings" aria-label="Settings">
            <img src="/assets/icons/settings.svg" alt="" />
          </Link>
          <Link to={`/users/${user.id}`} className="user-pill" style={{ textDecoration: 'none' }}>
            <span className="user-name">{user.name}</span>
            <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
          </Link>
          <button
            className="logout-icon-btn"
            onClick={onLogout}
            title="Log out"
            aria-label="Log out"
          >
            <img src="/assets/icons/log-out.svg" alt="" />
          </button>
        </div>
      </div>
    </header>
  )
}
