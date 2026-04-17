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
          <h1 className="app-title">It&apos;s A Problem</h1>
          <p className="app-subtitle">Anonymous problem board</p>
        </div>
        
        <div className="navbar-user">
          <div className="user-info">
            <span className="user-label">Logged in as</span>
            <span className="user-name">{user.name}</span>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
