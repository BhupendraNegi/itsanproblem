import { useState } from 'react'
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from './api'
import useAuth from './store'
import type { AuthResponse, Comment, Post } from './types'
import './App.css'

const queryClient = new QueryClient()

function AppContent() {
  const { user, logout, login } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [authFields, setAuthFields] = useState({ name: '', email: '', password: '', passwordConfirmation: '' })
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [postTitle, setPostTitle] = useState('')
  const [postBody, setPostBody] = useState('')
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({})

  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: api.fetchPosts,
  })
  const posts = data ?? []

  const authMutation = useMutation<AuthResponse, any, void>({
    mutationFn: async () => {
      if (mode === 'register') {
        return api.register({
          name: authFields.name,
          email: authFields.email,
          password: authFields.password,
          passwordConfirmation: authFields.passwordConfirmation,
        })
      }

      return api.login({ email: authFields.email, password: authFields.password })
    },
    onSuccess: (data: AuthResponse) => {
      login(data.user, data.token)
      setAlertMessage(null)
      setAuthFields({ name: '', email: '', password: '', passwordConfirmation: '' })
    },
    onError: (error: any) => {
      setAlertMessage(error?.response?.data?.error || error?.response?.data?.errors?.join(', ') || 'Could not complete request')
    },
  })

  const postMutation = useMutation<Post, any, { title: string; body: string }>({
    mutationFn: api.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      setPostTitle('')
      setPostBody('')
      setAlertMessage('Post created successfully')
    },
    onError: () => {
      setAlertMessage('Failed to create post')
    },
  })

  const commentMutation = useMutation<any, any, { postId: number; body: string }>({
    mutationFn: ({ postId, body }: { postId: number; body: string }) => api.createComment(postId, { body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      setAlertMessage('Comment added successfully')
    },
    onError: () => {
      setAlertMessage('Failed to add comment')
    },
  })

  function handleAuthSubmit(event: React.FormEvent) {
    event.preventDefault()
    authMutation.mutate()
  }

  function handlePostSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!user) {
      setAlertMessage('You must be signed in to create a post')
      return
    }

    postMutation.mutate({ title: postTitle.trim(), body: postBody.trim() })
  }

  function handleCommentSubmit(event: React.FormEvent, postId: number) {
    event.preventDefault()
    if (!user) {
      setAlertMessage('You must be signed in to comment')
      return
    }

    const commentBody = commentInputs[postId]?.trim() || ''
    if (!commentBody) return

    commentMutation.mutate({ postId, body: commentBody })
    setCommentInputs((current) => ({ ...current, [postId]: '' }))
  }

  function formatDate(timestamp: string) {
    return new Date(timestamp).toLocaleString()
  }

  if (!user) {
    return (
      <main className="app-shell">
        <section className="auth-panel">
          <div className="head-row">
            <div>
              <h1>It&apos;s Anonymized Problem</h1>
              <p>Register or log in, then share your anonymous post and let others comment with their name.</p>
            </div>
            <div className="auth-toggle">
              <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
                Login
              </button>
              <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
                Register
              </button>
            </div>
          </div>

          <form className="form-card" onSubmit={handleAuthSubmit}>
            {mode === 'register' && (
              <label>
                Name
                <input
                  value={authFields.name}
                  onChange={(event) => setAuthFields({ ...authFields, name: event.target.value })}
                  required
                />
              </label>
            )}
            <label>
              Email
              <input
                type="email"
                value={authFields.email}
                onChange={(event) => setAuthFields({ ...authFields, email: event.target.value })}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={authFields.password}
                onChange={(event) => setAuthFields({ ...authFields, password: event.target.value })}
                required
              />
            </label>
            {mode === 'register' && (
              <label>
                Confirm Password
                <input
                  type="password"
                  value={authFields.passwordConfirmation}
                  onChange={(event) => setAuthFields({ ...authFields, passwordConfirmation: event.target.value })}
                  required
                />
              </label>
            )}
            {alertMessage && <p className="alert">{alertMessage}</p>}
            <button type="submit" className="primary-button">
              {mode === 'register' ? 'Create Account' : 'Sign In'}
            </button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header className="header">
        <div>
          <h1>Anonymous problem board</h1>
          <p>Posts are anonymous. Comments show the author&apos;s name.</p>
        </div>
        <div className="user-bar">
          <span>Signed in as {user.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      {alertMessage && <p className="alert success">{alertMessage}</p>}

      <section className="form-card">
        <h2>Create a new anonymous post</h2>
        <form onSubmit={handlePostSubmit} className="stack">
          <label>
            Title
            <input value={postTitle} onChange={(event) => setPostTitle(event.target.value)} required />
          </label>
          <label>
            Problem details
            <textarea value={postBody} onChange={(event) => setPostBody(event.target.value)} rows={4} required />
          </label>
          <button type="submit" className="primary-button">Post anonymously</button>
        </form>
      </section>

      <section className="posts-grid">
        <header className="section-header">
          <h2>Latest posts</h2>
          <span>{isLoading ? 'Loading...' : `${posts.length} post(s)`}</span>
        </header>

        {posts.map((post: Post) => (
          <article key={post.id} className="post-card">
            <div className="post-header">
              <div>
                <h3>{post.title}</h3>
                <p className="meta">Posted anonymously · {formatDate(post.created_at)}</p>
              </div>
            </div>
            <p className="post-body">{post.body}</p>
            <div className="comments-section">
              <h4>Comments</h4>
              {post.comments.length === 0 ? (
                <p className="small-text">No comments yet.</p>
              ) : (
                <ul className="comment-list">
                  {post.comments.map((comment: Comment) => (
                    <li key={comment.id} className="comment-item">
                      <p>{comment.body}</p>
                      <span className="comment-meta">{comment.author} · {formatDate(comment.created_at)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <form className="comment-form" onSubmit={(event) => handleCommentSubmit(event, post.id)}>
                <textarea
                  value={commentInputs[post.id] || ''}
                  placeholder="Write a comment with your name"
                  onChange={(event) => setCommentInputs((current) => ({ ...current, [post.id]: event.target.value }))}
                  rows={2}
                  required
                />
                <button type="submit">Add comment</button>
              </form>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  )
}

export default App
