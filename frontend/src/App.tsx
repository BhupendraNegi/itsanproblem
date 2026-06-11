import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import useAuth from './store'
import { AuthPanel } from './components/AuthPanel'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { PostForm } from './components/PostForm'
import { PostCard } from './components/PostCard'
import { ProfilePage } from './pages/ProfilePage'
import { SettingsPage } from './pages/SettingsPage'
import { AdminPage } from './pages/AdminPage'
import { useAuthMutation, usePostMutation, useCommentMutation, usePosts } from './hooks/useMutations'
import './App.css'

const queryClient = new QueryClient()

function AppContent() {
  const { user, logout, login } = useAuth()
  const location = useLocation()
  const [mode, setMode] = useState<'login' | 'register'>('login')

  // The admin route is sign-in only: no account creation from /admin.
  const allowRegister = !location.pathname.startsWith('/admin')
  const [authFields, setAuthFields] = useState({ name: '', email: '', password: '', passwordConfirmation: '' })
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [postTitle, setPostTitle] = useState('')
  const [postBody, setPostBody] = useState('')
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({})
  const [sort, setSort] = useState<'recent' | 'hot'>('recent')

  const { data, isLoading, error } = usePosts(sort)
  const posts = data ?? []

  const authMutation = useAuthMutation(setAlertMessage, setAuthFields, login)
  const postMutation = usePostMutation(setAlertMessage, setPostTitle, setPostBody)
  const commentMutation = useCommentMutation(setAlertMessage, setCommentInputs)

  // Clear alert message after 5 seconds
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [alertMessage])

  // If register mode was selected elsewhere, snap back to login on /admin.
  useEffect(() => {
    if (!allowRegister && mode === 'register') setMode('login')
  }, [allowRegister, mode])

  function handleAuthSubmit(event: React.FormEvent) {
    event.preventDefault()
    authMutation.mutate({ mode, fields: authFields })
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
  }

  if (!user) {
    return (
      <>
        <header className="navbar">
          <div className="navbar-container">
            <div className="navbar-brand">
              <img src="/assets/logo-iap-mark.svg" alt="" />
              <div>
                <h1 className="app-title">it&apos;s an problem<span className="dot">.</span></h1>
                <p className="app-subtitle">Anonymous problem board</p>
              </div>
            </div>
          </div>
        </header>
        <AuthPanel
          mode={mode}
          setMode={setMode}
          authFields={authFields}
          setAuthFields={setAuthFields}
          onSubmit={handleAuthSubmit}
          isLoading={authMutation.isPending}
          error={alertMessage}
          allowRegister={allowRegister}
        />
      </>
    )
  }

  const feed = (
    <main className="app-shell">
      <Header user={user} onLogout={logout} />

      {alertMessage && <div className="alert success">{alertMessage}</div>}

      <PostForm
        title={postTitle}
        setTitle={setPostTitle}
        body={postBody}
        setBody={setPostBody}
        onSubmit={handlePostSubmit}
        isLoading={postMutation.isPending}
      />

      <section className="posts-grid">
        <header className="section-header">
          <h2>{sort === 'hot' ? 'Hot this week' : 'Latest posts'}</h2>
          <div className="right">
            <div className="segmented" role="tablist" aria-label="Sort posts">
              <button
                role="tab"
                aria-selected={sort === 'recent'}
                className={sort === 'recent' ? 'is-active' : ''}
                onClick={() => setSort('recent')}
              >
                Recent
              </button>
              <button
                role="tab"
                aria-selected={sort === 'hot'}
                className={sort === 'hot' ? 'is-active' : ''}
                onClick={() => setSort('hot')}
              >
                Hot
              </button>
            </div>
            <span>{isLoading ? 'Loading…' : `${posts.length} post${posts.length === 1 ? '' : 's'}`}</span>
            <button
              className="btn-ghost"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['posts'] })}
              disabled={isLoading}
            >
              <img src="/assets/icons/refresh-cw.svg" alt="" style={{ width: 14, height: 14 }} />
              Refresh
            </button>
          </div>
        </header>

        {error && <div className="alert danger">Failed to load posts. Please try again.</div>}

        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            commentInputs={commentInputs}
            setCommentInputs={setCommentInputs}
            onCommentSubmit={handleCommentSubmit}
            isCommentLoading={commentMutation.isPending}
          />
        ))}
      </section>
    </main>
  )

  return (
    <Routes>
      <Route path="/" element={feed} />
      <Route path="/users/:id" element={<ProfilePage currentUser={user} onLogout={logout} />} />
      <Route path="/settings" element={<SettingsPage currentUser={user} onLogout={logout} />} />
      <Route path="/admin" element={<AdminPage currentUser={user} onLogout={logout} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Footer />
    </QueryClientProvider>
  )
}

export default App
