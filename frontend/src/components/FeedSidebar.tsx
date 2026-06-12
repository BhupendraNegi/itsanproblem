import { Link } from 'react-router-dom'
import { useTags, useUserProfile } from '../hooks/useMutations'
import { avatarHueClass } from '../avatar'
import type { User } from '../types'

// Desktop-only companion column on the feed: who you are + quick links.
export function FeedSidebar({ user }: { user: User }) {
  const { data: profile } = useUserProfile(user.username ?? String(user.id))
  const { data: tags } = useTags()
  const isStaff = user.role === 'admin' || user.role === 'moderator'
  const profileHandle = user.username ?? user.id

  return (
    <aside className="feed-sidebar">
      <div className="card sidebar-profile">
        <Link to={`/users/${profileHandle}`} className="sidebar-profile-head">
          <span className={`sidebar-avatar ${avatarHueClass(user.username ?? user.name)}`}>
            {user.name.charAt(0).toUpperCase()}
          </span>
          <span className="sidebar-identity">
            <strong>{user.name}</strong>
            {profile && <span className="sidebar-handle">@{profile.username}</span>}
          </span>
        </Link>
        {profile?.bio && <p className="sidebar-bio">{profile.bio}</p>}
        <div className="sidebar-stats">
          <div>
            <strong className="accent-text">{profile?.helpful_points ?? 0}</strong>
            <span>helpful pts</span>
          </div>
          <div>
            <strong className="primary-text">{profile?.comment_count ?? 0}</strong>
            <span>replies</span>
          </div>
          <div>
            <strong>{profile?.posts?.length ?? 0}</strong>
            <span>posts</span>
          </div>
        </div>
      </div>

      {tags && tags.length > 0 && (
        <nav className="card sidebar-nav" aria-label="Rooms">
          <span className="sidebar-nav-label">Rooms</span>
          {tags.map((t) => (
            <Link key={t.slug} to={`/?tag=${t.slug}`}>
              {t.name}
              {t.post_count > 0 && <span className="room-count">{t.post_count}</span>}
            </Link>
          ))}
        </nav>
      )}

      <nav className="card sidebar-nav" aria-label="Quick links">
        <Link to={`/users/${profileHandle}`}>
          <img src="/assets/icons/user.svg" alt="" className="menu-icon" />
          Your profile
        </Link>
        <Link to="/settings">
          <img src="/assets/icons/settings.svg" alt="" className="menu-icon" />
          Settings
        </Link>
        {isStaff && (
          <Link to="/admin">
            <img src="/assets/icons/users.svg" alt="" className="menu-icon" />
            Admin
          </Link>
        )}
      </nav>
    </aside>
  )
}
