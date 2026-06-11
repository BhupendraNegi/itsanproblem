import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Breadcrumbs } from '../components/Breadcrumbs'
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
import type { Role, User } from '../types'

const ROLES: Role[] = ['member', 'moderator', 'admin']

interface AdminPageProps {
  currentUser: User
  onLogout: () => void
}

function reasonsLabel(reasons: Record<string, number>) {
  return Object.entries(reasons)
    .map(([reason, count]) => `${reason.replace('_', ' ')} ×${count}`)
    .join(', ')
}

export function AdminPage({ currentUser, onLogout }: AdminPageProps) {
  const navigate = useNavigate()
  const { startImpersonation } = useAuth()
  const queryClient = useQueryClient()
  const [userQuery, setUserQuery] = useState('')

  const isAdmin = currentUser.role === 'admin'
  const isStaff = isAdmin || currentUser.role === 'moderator'

  // enabled: isStaff stops 403 noise when a non-staff session briefly mounts
  // this page before the redirect below kicks in
  const { data: stats } = useAdminStats(isStaff)
  const { data: flagged } = useAdminFlags(isStaff)
  const { data: users } = useAdminUsers(userQuery, isStaff)

  const moderation = useAdminModerationMutation()
  const roleMutation = useAdminRoleMutation()
  const deleteUser = useAdminDeleteUserMutation()
  const impersonate = useImpersonateMutation()

  if (!isStaff) {
    return <Navigate to="/" replace />
  }

  function handleImpersonate(id: number) {
    impersonate.mutate(
      { id },
      {
        onSuccess: ({ user, token }) => {
          startImpersonation(user, token)
          // Everything cached so far belongs to the staff session.
          queryClient.clear()
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
      <main className="app-shell">
        <Breadcrumbs items={[{ label: 'Admin' }]} />

        <h1 className="page-title">Admin</h1>

        {/* Stats */}
        {stats && (
          <section className="card admin-stats">
            {([
              ['users', stats.users],
              ['posts', stats.posts],
              ['comments', stats.comments],
              ['flags', stats.flags],
              ['hidden posts', stats.hidden_posts],
              ['hidden comments', stats.hidden_comments],
            ] as const).map(([label, value]) => (
              <div key={label} className="stat-cell">
                <div className="stat-value primary">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </section>
        )}

        {/* Moderation queue */}
        <section className="page-section">
          <h2 className="section-title">Moderation queue</h2>
          {flaggedPosts.length === 0 && flaggedComments.length === 0 ? (
            <div className="card empty">
              <h3>Queue is clear</h3>
              <p>Flagged posts and replies will show up here.</p>
            </div>
          ) : (
            <div className="card-list">
              {flaggedPosts.map((post) => (
                <div key={`post-${post.id}`} className="card item-card">
                  <p className="item-title">{post.title}</p>
                  <p className="item-body">{post.body}</p>
                  <div className="meta-line">
                    <span>post</span>
                    <span>· {reasonsLabel(post.reasons)}</span>
                    {post.hidden && <span className="alert-note">· hidden</span>}
                    <span className="spacer" />
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
                <div key={`comment-${comment.id}`} className="card item-card">
                  <p className="item-body">{comment.body}</p>
                  <div className="meta-line">
                    <span>reply on “{comment.post_title}”</span>
                    <span>· {reasonsLabel(comment.reasons)}</span>
                    {comment.hidden && <span className="alert-note">· hidden</span>}
                    <span className="spacer" />
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
        <section className="page-section">
          <h2 className="section-title">Users</h2>
          <label className="field search-field">
            <span>Search</span>
            <input value={userQuery} onChange={(e) => setUserQuery(e.target.value)} placeholder="Name, username, or email" />
          </label>
          <div className="card-list">
            {(users ?? []).map((u) => (
              <div key={u.id} className="card admin-user-row">
                <div className="admin-user-info">
                  <div className="admin-user-name">
                    {u.name}
                    {u.role !== 'member' && <span className="role-chip">{u.role}</span>}
                  </div>
                  <div className="meta-line">
                    @{u.username} · {u.email} · {u.post_count} posts · {u.comment_count} replies
                  </div>
                </div>
                {u.id !== currentUser.id && (
                  <div className="row-actions">
                    {/* Moderators may impersonate members only; admins anyone. */}
                    {(isAdmin || u.role === 'member') && (
                      <button className="action-btn" disabled={impersonate.isPending} onClick={() => handleImpersonate(u.id)}>
                        Impersonate
                      </button>
                    )}
                    {isAdmin && (
                      <label className="role-select">
                        Role
                        <select
                          value={u.role}
                          disabled={roleMutation.isPending}
                          onChange={(e) => roleMutation.mutate({ id: u.id, role: e.target.value as Role })}
                        >
                          {ROLES.map((role) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </label>
                    )}
                    {isAdmin && (
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
                    )}
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
