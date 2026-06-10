import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Header } from '../components/Header'
import {
  useAdminDeleteUserMutation,
  useAdminFlags,
  useAdminModerationMutation,
  useAdminRoleMutation,
  useAdminStats,
  useAdminUsers,
  useImpersonateMutation,
} from '../hooks/useMutations'
import useAuth from '../store'
import type { User } from '../types'

interface AdminPageProps {
  currentUser: User
  onLogout: () => void
}

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 20,
  fontWeight: 600,
  letterSpacing: '-0.01em',
  margin: 0,
}

function reasonsLabel(reasons: Record<string, number>) {
  return Object.entries(reasons)
    .map(([reason, count]) => `${reason.replace('_', ' ')} ×${count}`)
    .join(', ')
}

export function AdminPage({ currentUser, onLogout }: AdminPageProps) {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [userQuery, setUserQuery] = useState('')

  const { data: stats } = useAdminStats()
  const { data: flagged } = useAdminFlags()
  const { data: users } = useAdminUsers(userQuery)

  const moderation = useAdminModerationMutation()
  const roleMutation = useAdminRoleMutation()
  const deleteUser = useAdminDeleteUserMutation()
  const impersonate = useImpersonateMutation()

  if (currentUser.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  function handleImpersonate(id: number) {
    impersonate.mutate(
      { id },
      {
        onSuccess: ({ user, token }) => {
          login(user, token)
          navigate('/')
        },
      }
    )
  }

  const flaggedPosts = flagged?.posts ?? []
  const flaggedComments = flagged?.comments ?? []

  return (
    <>
      <Header user={currentUser} onLogout={onLogout} />
      <main className="app-shell" style={{ maxWidth: 860 }}>
        <Link to="/" className="btn-ghost" style={{ width: 'fit-content', paddingLeft: 0 }}>
          <img src="/assets/icons/arrow-right.svg" alt="" style={{ width: 16, height: 16, transform: 'rotate(180deg)' }} />
          Back to feed
        </Link>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.015em', margin: 0 }}>
          Admin
        </h1>

        {/* Stats */}
        {stats && (
          <section className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 12 }}>
            {([
              ['users', stats.users],
              ['posts', stats.posts],
              ['comments', stats.comments],
              ['flags', stats.flags],
              ['hidden posts', stats.hidden_posts],
              ['hidden comments', stats.hidden_comments],
            ] as const).map(([label, value]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>{value}</div>
                <div style={{ fontSize: 12, color: 'var(--fg2)' }}>{label}</div>
              </div>
            ))}
          </section>
        )}

        {/* Moderation queue */}
        <section style={{ display: 'grid', gap: 12 }}>
          <h2 style={sectionTitle}>Moderation queue</h2>
          {flaggedPosts.length === 0 && flaggedComments.length === 0 ? (
            <div className="card empty">
              <h3>Queue is clear</h3>
              <p>Flagged posts and replies will show up here.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {flaggedPosts.map((post) => (
                <div key={`post-${post.id}`} className="card" style={{ padding: '16px 20px', display: 'grid', gap: 8 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{post.title}</p>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--fg2)' }}>{post.body}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg2)' }}>
                    <span>post</span>
                    <span>· {reasonsLabel(post.reasons)}</span>
                    {post.hidden && <span style={{ color: 'var(--accent)' }}>· hidden</span>}
                    <span style={{ flex: 1 }} />
                    <button className="action-btn" disabled={moderation.isPending}
                      onClick={() => moderation.mutate({ action: 'restore', target: 'posts', id: post.id })}>
                      Restore
                    </button>
                    <button className="action-btn" disabled={moderation.isPending}
                      onClick={() => moderation.mutate({ action: 'delete', target: 'posts', id: post.id })}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {flaggedComments.map((comment) => (
                <div key={`comment-${comment.id}`} className="card" style={{ padding: '16px 20px', display: 'grid', gap: 8 }}>
                  <p style={{ margin: 0, fontSize: 13 }}>{comment.body}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg2)' }}>
                    <span>reply on “{comment.post_title}”</span>
                    <span>· {reasonsLabel(comment.reasons)}</span>
                    {comment.hidden && <span style={{ color: 'var(--accent)' }}>· hidden</span>}
                    <span style={{ flex: 1 }} />
                    <button className="action-btn" disabled={moderation.isPending}
                      onClick={() => moderation.mutate({ action: 'restore', target: 'comments', id: comment.id })}>
                      Restore
                    </button>
                    <button className="action-btn" disabled={moderation.isPending}
                      onClick={() => moderation.mutate({ action: 'delete', target: 'comments', id: comment.id })}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Users */}
        <section style={{ display: 'grid', gap: 12 }}>
          <h2 style={sectionTitle}>Users</h2>
          <label className="field" style={{ maxWidth: 320 }}>
            <span>Search</span>
            <input value={userQuery} onChange={(e) => setUserQuery(e.target.value)} placeholder="Name or email" />
          </label>
          <div style={{ display: 'grid', gap: 8 }}>
            {(users ?? []).map((u) => (
              <div key={u.id} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {u.name}
                    {u.role === 'admin' && (
                      <span style={{ marginLeft: 8, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>admin</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg2)', fontFamily: 'var(--font-mono)' }}>
                    {u.email} · {u.post_count} posts · {u.comment_count} replies
                  </div>
                </div>
                {u.id !== currentUser.id && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="action-btn" disabled={impersonate.isPending} onClick={() => handleImpersonate(u.id)}>
                      Impersonate
                    </button>
                    <button
                      className="action-btn"
                      disabled={roleMutation.isPending}
                      onClick={() => roleMutation.mutate({ id: u.id, role: u.role === 'admin' ? 'member' : 'admin' })}
                    >
                      {u.role === 'admin' ? 'Demote' : 'Make admin'}
                    </button>
                    <button
                      className="action-btn"
                      disabled={deleteUser.isPending}
                      onClick={() => {
                        if (window.confirm(`Delete ${u.name} and all their posts? This cannot be undone.`)) {
                          deleteUser.mutate({ id: u.id })
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
