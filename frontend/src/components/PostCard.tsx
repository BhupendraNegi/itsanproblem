import type { Comment, Post } from '../types'

interface PostCardProps {
  post: Post
  commentInputs: Record<number, string>
  setCommentInputs: (inputs: Record<number, string> | ((current: Record<number, string>) => Record<number, string>)) => void
  onCommentSubmit: (event: React.FormEvent, postId: number) => void
  isCommentLoading: boolean
}

function formatDate(timestamp: string) {
  return new Date(timestamp).toLocaleString()
}

export function PostCard({
  post,
  commentInputs,
  setCommentInputs,
  onCommentSubmit,
  isCommentLoading
}: PostCardProps) {
  return (
    <article className="post-card">
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
        <form className="comment-form" onSubmit={(event) => onCommentSubmit(event, post.id)}>
          <textarea
            value={commentInputs[post.id] || ''}
            placeholder="Write a comment with your name"
            onChange={(event) => setCommentInputs((current) => ({ ...current, [post.id]: event.target.value }))}
            rows={2}
            required
          />
          <button type="submit" disabled={isCommentLoading}>
            {isCommentLoading ? 'Commenting...' : 'Add comment'}
          </button>
        </form>
      </div>
    </article>
  )
}
