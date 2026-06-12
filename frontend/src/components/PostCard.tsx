import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useHelpfulMutation } from '../hooks/useMutations'
import { avatarHueClass } from '../avatar'
import { FlagButton } from './FlagButton'
import type { Comment, Post } from '../types'

interface PostCardProps {
  post: Post
  commentInputs: Record<number, string>
  setCommentInputs: (inputs: Record<number, string> | ((current: Record<number, string>) => Record<number, string>)) => void
  onCommentSubmit: (event: React.FormEvent, postId: number, anonymous: boolean) => void
  isCommentLoading: boolean
  // detail page: full body, plain (unlinked) title
  expanded?: boolean
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
  isCommentLoading,
  expanded = false
}: PostCardProps) {
  const helpfulCount = post.helpful_count ?? 0
  const isHot = helpfulCount >= 10
  const helpfulMutation = useHelpfulMutation()
  const [replyAnon, setReplyAnon] = useState(false)

  return (
    <article className="post-card">
      <div className="post-byline">
        {post.anonymous !== false || post.author_id == null ? (
          <span className="post-avatar anon-mask">
            <img src="/assets/icons/user-x.svg" alt="" />
          </span>
        ) : (
          <Link to={`/users/${post.author_username ?? post.author_id}`} className="post-avatar-link">
            <span className={`post-avatar ${avatarHueClass(post.author_username ?? post.author)}`}>
              {post.author.charAt(0).toUpperCase()}
            </span>
          </Link>
        )}
        <span className="post-byline-text">
          {post.anonymous !== false || post.author_id == null ? (
            <strong>Anonymous</strong>
          ) : (
            <Link to={`/users/${post.author_username ?? post.author_id}`} className="post-author-link">
              <strong>{post.author}</strong>
            </Link>
          )}
          <span>
            {formatRelative(post.created_at)} · {post.comments.length} {post.comments.length === 1 ? 'reply' : 'replies'}
          </span>
        </span>
        {post.tag && (
          <Link to={`/?tag=${post.tag.slug}`} className="tag-chip">{post.tag.name}</Link>
        )}
        {isHot && (
          <span className="hot-badge">
            <img src="/assets/icons/flame.svg" alt="" />
            {helpfulCount}
          </span>
        )}
      </div>

      <header className="post-header">
        {expanded ? (
          <h3 className="post-title">{post.title}</h3>
        ) : (
          <Link to={`/posts/${post.id}`} className="post-title-link">
            <h3 className="post-title">{post.title}</h3>
          </Link>
        )}
      </header>

      <p className={`post-body${expanded ? ' expanded' : ''}`}>{post.body}</p>

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
        <FlagButton target="posts" id={post.id} />
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
                    <>
                      <Link to={`/users/${comment.author_username ?? comment.author_id}`}>
                        <strong>{comment.author}</strong>
                      </Link>
                      {comment.op && <span className="op-badge" title="The post's author">OP</span>}
                    </>
                  ) : (
                    <>
                      <strong>{comment.author}</strong>
                      {comment.op && <span className="op-badge" title="The post's author">OP</span>}
                    </>
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
                  {' '}·{' '}
                  <FlagButton target="comments" id={comment.id} compact />
                </span>
              </li>
            ))}
          </ul>
        )}

        <form className="comment-form" onSubmit={(e) => onCommentSubmit(e, post.id, replyAnon)}>
          <label className="field">
            <span>{replyAnon ? 'Replying anonymously — no name attached' : 'Reply as yourself — your name is attached'}</span>
            <textarea
              value={commentInputs[post.id] || ''}
              onChange={(e) => setCommentInputs((curr) => ({ ...curr, [post.id]: e.target.value }))}
              placeholder="Write something useful."
              maxLength={2000}
              rows={2}
              required
            />
          </label>
          <div className="comment-form-actions">
            <label className="checkbox-row reply-anon-toggle">
              <input type="checkbox" checked={replyAnon} onChange={(e) => setReplyAnon(e.target.checked)} />
              Reply anonymously
            </label>
            <button type="submit" className="btn-primary" disabled={isCommentLoading || !commentInputs[post.id]?.trim()}>
              {isCommentLoading ? 'Posting…' : 'Post reply'}
            </button>
          </div>
        </form>
      </div>
    </article>
  )
}
