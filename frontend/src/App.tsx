import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import useAuth from './store'
import { AuthPanel } from './components/AuthPanel'
import { Header } from './components/Header'
import { PostForm } from './components/PostForm'
import { PostCard } from './components/PostCard'
import { useAuthMutation, usePostMutation, useCommentMutation, usePosts } from './hooks/useMutations'
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

  const { data, isLoading, error } = usePosts()
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
              <h1 className="app-title">It&apos;s A Problem</h1>
              <p className="app-subtitle">Anonymous problem board</p>
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
        />
      </>
    )
  }

  return (
    <main className="app-shell">
      <Header user={user} onLogout={logout} />

      {alertMessage && <p className="alert success">{alertMessage}</p>}

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
          <h2>Latest posts</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span>{isLoading ? 'Loading...' : `${posts.length} post(s)`}</span>
            <button onClick={() => queryClient.invalidateQueries({ queryKey: ['posts'] })} disabled={isLoading}>
              Refresh
            </button>
          </div>
        </header>

        {error && <p className="alert">Failed to load posts. Please try again.</p>}

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
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  )
}

export default App
