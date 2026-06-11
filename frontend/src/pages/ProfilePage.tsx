import { useParams, Link } from 'react-router-dom'
import { useUserProfile } from '../hooks/useMutations'
import { Header } from '../components/Header'
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
      <main className="app-shell" style={{ maxWidth: 720 }}>
        <Link to="/" className="btn-ghost" style={{ width: 'fit-content', paddingLeft: 0 }}>
          <img src="/assets/icons/arrow-right.svg" alt="" style={{ width: 16, height: 16, transform: 'rotate(180deg)' }} />
          Back to feed
        </Link>

        {isLoading && (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--fg2)' }}>
            Loading…
          </div>
        )}

        {error && (
          <div className="alert danger">Failed to load profile. Please try again.</div>
        )}

        {profile && (
          <>
            {/* Profile header */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{
                  width: 64, height: 64,
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--gradient-brand)',
                  color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontSize: 28, fontWeight: 700,
                  flexShrink: 0
                }}>
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <h1 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 28, fontWeight: 700,
                    letterSpacing: '-0.015em', margin: 0
                  }}>
                    {profile.name}
                    {isOwnProfile && (
                      <span style={{
                        marginLeft: 10,
                        fontSize: 12, fontWeight: 600,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--fg-on-primary)',
                        background: 'var(--primary)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-pill)',
                        verticalAlign: 'middle'
                      }}>you</span>
                    )}
                  </h1>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--fg2)', fontFamily: 'var(--font-mono)' }}>
                    @{profile.username} · Joined {formatJoined(profile.joined_at)}
                  </p>
                  {profile.bio && (
                    <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--fg1)', lineHeight: 1.5 }}>
                      {profile.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 12, marginTop: 24,
                borderTop: '1px solid var(--border-subtle)', paddingTop: 20
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 32, fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: 'var(--accent)'
                  }}>
                    {profile.helpful_points}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg2)', marginTop: 2 }}>helpful points</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 32, fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: 'var(--primary)'
                  }}>
                    {profile.comment_count}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg2)', marginTop: 2 }}>replies written</div>
                </div>
              </div>
            </div>

            {/* Own anonymous posts — only present on your own profile */}
            {profile.posts && (
              <section>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 20, fontWeight: 600,
                  letterSpacing: '-0.01em',
                  margin: '0 0 6px'
                }}>
                  Your posts
                </h2>
                <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--fg2)' }}>
                  Only you can see this list — everyone else sees these posts as anonymous.
                </p>

                {profile.posts.length === 0 ? (
                  <div className="card empty">
                    <h3>No posts yet</h3>
                    <p>Problems you post will show up here, visible only to you.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {profile.posts.map((post) => (
                      <div key={post.id} className="card" style={{ padding: '16px 20px', gap: 8, display: 'grid' }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{post.title}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--fg2)', fontFamily: 'var(--font-mono)' }}>
                          <span>{post.anon_handle}</span>
                          <span style={{ color: 'var(--fg3)' }}>·</span>
                          <span>{post.comment_count} {post.comment_count === 1 ? 'reply' : 'replies'}</span>
                          <span style={{ color: 'var(--fg3)' }}>·</span>
                          <span>{post.helpful_count} helpful</span>
                          <span style={{ color: 'var(--fg3)' }}>·</span>
                          <span>{formatRelative(post.created_at)}</span>
                          {post.hidden && <span style={{ color: 'var(--accent)' }}>· hidden pending review</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Recent comments */}
            <section>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20, fontWeight: 600,
                letterSpacing: '-0.01em',
                margin: '0 0 14px'
              }}>
                Recent replies
              </h2>

              {profile.recent_comments.length === 0 ? (
                <div className="card empty">
                  <h3>No replies yet</h3>
                  <p>When {isOwnProfile ? 'you reply' : `${profile.name} replies`} to a post, it'll show here.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                  {profile.recent_comments.map((comment) => (
                    <div key={comment.id} className="card" style={{ padding: '16px 20px', gap: 8, display: 'grid' }}>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{comment.body}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--fg2)', fontFamily: 'var(--font-mono)' }}>
                        <span style={{ color: 'var(--fg1)', fontWeight: 600 }}>{comment.post_title}</span>
                        <span style={{ color: 'var(--fg3)' }}>·</span>
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
