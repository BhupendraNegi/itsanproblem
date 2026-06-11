import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFlagMutation, useHelpfulMutation } from '../hooks/useMutations'
import type { Comment, Post } from '../types'

const FLAG_REASONS = [
  { value: 'harm', label: 'Harmful' },
  { value: 'spam', label: 'Spam' },
  { value: 'identifying_info', label: 'Identifying info' },
]

interface PostCardProps {
  post: Post
  commentInputs: Record<number, string>
  setCommentInputs: (inputs: Record<number, string> | ((current: Record<number, string>) => Record<number, string>)) => void
  onCommentSubmit: (event: React.FormEvent, postId: number) => void
  isCommentLoading: boolean
}

function formatRelative(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

export function PostCard({
  post,
  commentInputs,
  setCommentInputs,
  onCommentSubmit,
  isCommentLoading
}: PostCardProps) {
  const helpfulCount = post.helpful_count ?? 0
  const isHot = helpfulCount >= 10
  const handle = post.anon_handle ?? 'anonymous'
  const helpfulMutation = useHelpfulMutation()
  const flagMutation = useFlagMutation()
  const [flagMenuOpen, setFlagMenuOpen] = useState(false)
  const [reported, setReported] = useState(false)

  function handleFlag(reason: string) {
    flagMutation.mutate(
      { target: 'posts', id: post.id, reason },
      { onSuccess: () => setReported(true) }
    )
    setFlagMenuOpen(false)
  }

  return (
    <article className="post-card">
      <header className="post-header">
        <h3 className="post-title">{post.title}</h3>
        {isHot && (
          <span className="hot-badge">
            <img src="/assets/icons/flame.svg" alt="" />
            {helpfulCount}
          </span>
        )}
      </header>

      <p className="post-body">{post.body}</p>

      <div className="post-meta">
        <span>{handle}</span>
        <span className="dot">·</span>
        <span>{formatRelative(post.created_at)}</span>
        <span className="dot">·</span>
        <span>{post.comments.length} {post.comments.length === 1 ? 'reply' : 'replies'}</span>
      </div>

      <div className="post-actions" onClick={(e) => e.stopPropagation()}>
        <button
          className={`action-btn${post.viewer_marked ? ' is-active' : ''}`}
          onClick={() => helpfulMutation.mutate({ target: 'posts', id: post.id, marked: !!post.viewer_marked })}
          disabled={helpfulMutation.isPending}
        >
          <img src="/assets/icons/heart.svg" alt="" />
          {post.viewer_marked ? 'Marked helpful' : 'Mark helpful'}
          {helpfulCount > 0 && <> · {helpfulCount}</>}
        </button>
        {reported ? (
          <span className="action-btn is-active">Reported ✓</span>
        ) : (
          <button className="action-btn" onClick={() => setFlagMenuOpen((open) => !open)}>
            <img src="/assets/icons/flag.svg" alt="" />
            Flag
          </button>
        )}
        {flagMenuOpen && !reported && (
          <span className="flag-menu">
            {FLAG_REASONS.map(({ value, label }) => (
              <button key={value} className="action-btn" onClick={() => handleFlag(value)} disabled={flagMutation.isPending}>
                {label}
              </button>
            ))}
          </span>
        )}
      </div>

      <div className="comments-section">
        <h4>{post.comments.length === 0 ? 'No comments yet' : `${post.comments.length} ${post.comments.length === 1 ? 'reply' : 'replies'}`}</h4>
        {post.comments.length === 0 ? (
          <p className="empty-hint">Be the first to say something useful.</p>
        ) : (
          <ul className="comment-list">
            {post.comments.map((comment: Comment) => (
              <li key={comment.id} className="comment-item">
                <p>{comment.body}</p>
                <span className="comment-meta">
                  {comment.author_id != null ? (
                    <Link to={`/users/${comment.author_username ?? comment.author_id}`}>
                      <strong>{comment.author}</strong>
                    </Link>
                  ) : (
                    <strong>{comment.author}</strong>
                  )}
                  {' '}· {formatRelative(comment.created_at)}
                  {' '}·{' '}
                  <button
                    className={`action-btn comment-helpful${comment.viewer_marked ? ' is-active' : ''}`}
                    onClick={() => helpfulMutation.mutate({ target: 'comments', id: comment.id, marked: !!comment.viewer_marked })}
                    disabled={helpfulMutation.isPending}
                  >
                    Helpful{(comment.helpful_count ?? 0) > 0 && <> · {comment.helpful_count}</>}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}

        <form className="comment-form" onSubmit={(e) => onCommentSubmit(e, post.id)}>
          <label className="field">
            <span>Reply as <strong>{post.author || 'you'}</strong></span>
            <textarea
              value={commentInputs[post.id] || ''}
              onChange={(e) => setCommentInputs((curr) => ({ ...curr, [post.id]: e.target.value }))}
              placeholder="Write something useful. Your name is attached."
              rows={2}
              required
            />
          </label>
          <div className="comment-form-actions">
            <button type="submit" className="btn-primary" disabled={isCommentLoading || !commentInputs[post.id]?.trim()}>
              {isCommentLoading ? 'Posting…' : 'Post reply'}
            </button>
          </div>
        </form>
      </div>
    </article>
  )
}
