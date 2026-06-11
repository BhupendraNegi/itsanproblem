import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { Header } from '../components/Header'
import { PostCard } from '../components/PostCard'
import { useCommentMutation, usePost } from '../hooks/useMutations'
import type { User } from '../types'

interface PostPageProps {
  currentUser: User
  onLogout: () => void
}

export function PostPage({ currentUser, onLogout }: PostPageProps) {
  const { id } = useParams<{ id: string }>()
  const postId = Number(id)
  const { data: post, isLoading, error } = usePost(postId)

  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({})
  const commentMutation = useCommentMutation(setAlertMessage, setCommentInputs)

  function handleCommentSubmit(event: React.FormEvent, targetPostId: number) {
    event.preventDefault()
    const body = commentInputs[targetPostId]?.trim() || ''
    if (!body) return
    commentMutation.mutate({ postId: targetPostId, body })
  }

  return (
    <>
      <Header user={currentUser} onLogout={onLogout} />
      <main className="app-shell">
        <Breadcrumbs items={[{ label: post ? post.title : 'Post' }]} />

        {alertMessage && <div className="alert success">{alertMessage}</div>}
        {isLoading && <div className="card loading-card">Loading…</div>}
        {error && (
          <div className="alert danger">
            This post doesn't exist or was removed.
          </div>
        )}

        {post && (
          <PostCard
            post={post}
            expanded
            commentInputs={commentInputs}
            setCommentInputs={setCommentInputs}
            onCommentSubmit={handleCommentSubmit}
            isCommentLoading={commentMutation.isPending}
          />
        )}
      </main>
    </>
  )
}
