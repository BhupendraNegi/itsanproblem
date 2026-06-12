import { useParams } from 'react-router-dom'
import { useUserProfile } from '../hooks/useMutations'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { Header } from '../components/Header'
import { avatarHueClass } from '../avatar'
import type { User } from '../types'

interface ProfilePageProps {
  currentUser: User
  onLogout: () => void
}

function formatRelative(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return 'today'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

function formatJoined(timestamp: string) {
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function ProfilePage({ currentUser, onLogout }: ProfilePageProps) {
  const { handle } = useParams<{ handle: string }>()
  const { data: profile, isLoading, error } = useUserProfile(handle ?? '')

  const isOwnProfile = profile?.id === currentUser.id

  return (
    <>
      <Header user={currentUser} onLogout={onLogout} />
      <main className="app-shell">
        <Breadcrumbs items={[{ label: profile ? `@${profile.username}` : 'Profile' }]} />

        {isLoading && <div className="card loading-card">Loading…</div>}

        {error && (
          <div className="alert danger">Failed to load profile. Please try again.</div>
        )}

        {profile && (
          <>
            {/* Profile header */}
            <div className="card">
              <div className="profile-header">
                <div className={`profile-avatar ${avatarHueClass(profile.username)}`}>{profile.name.charAt(0).toUpperCase()}</div>
                <div className="profile-identity">
                  <h1 className="profile-name">
                    {profile.name}
                    {isOwnProfile && <span className="you-badge">you</span>}
                  </h1>
                  <p className="profile-joined">
                    @{profile.username} · Joined {formatJoined(profile.joined_at)}
                  </p>
                  {profile.bio && <p className="profile-bio">{profile.bio}</p>}
                </div>
              </div>

              {/* Stats row */}
              <div className="stats-row">
                <div className="stat-cell">
                  <div className="stat-value accent">{profile.helpful_points}</div>
                  <div className="stat-label">helpful points</div>
                </div>
                <div className="stat-cell">
                  <div className="stat-value primary">{profile.comment_count}</div>
                  <div className="stat-label">replies written</div>
                </div>
              </div>
            </div>

            {/* Own profile: all posts (anonymous included). Others: named only. */}
            {profile.posts && (
              <section className="page-section">
                <h2 className="section-title">{isOwnProfile ? 'Your posts' : 'Posts'}</h2>
                {isOwnProfile && (
                  <p className="section-hint">
                    Anonymous posts appear here only for you — everyone else sees them with no author at all.
                  </p>
                )}

                {profile.posts.length === 0 ? (
                  <div className="card empty">
                    <h3>No posts yet</h3>
                    <p>Problems you post will show up here, visible only to you.</p>
                  </div>
                ) : (
                  <div className="card-list">
                    {profile.posts.map((post) => (
                      <div key={post.id} className="card item-card">
                        <p className="item-title">{post.title}</p>
                        <div className="meta-line">
                          {post.anonymous && <span className="alert-note">anonymous</span>}
                          {post.anonymous && <span className="sep">·</span>}
                          <span>{post.comment_count} {post.comment_count === 1 ? 'reply' : 'replies'}</span>
                          <span className="sep">·</span>
                          <span>{post.helpful_count} helpful</span>
                          <span className="sep">·</span>
                          <span>{formatRelative(post.created_at)}</span>
                          {post.hidden && <span className="alert-note">· hidden pending review</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Recent comments */}
            <section className="page-section">
              <h2 className="section-title">Recent replies</h2>

              {profile.recent_comments.length === 0 ? (
                <div className="card empty">
                  <h3>No replies yet</h3>
                  <p>When {isOwnProfile ? 'you reply' : `${profile.name} replies`} to a post, it'll show here.</p>
                </div>
              ) : (
                <div className="card-list">
                  {profile.recent_comments.map((comment) => (
                    <div key={comment.id} className="card item-card">
                      <p className="item-body">{comment.body}</p>
                      <div className="meta-line">
                        <span className="strong">{comment.post_title}</span>
                        <span className="sep">·</span>
                        <span>{formatRelative(comment.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </>
  )
}
