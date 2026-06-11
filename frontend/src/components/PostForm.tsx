import { useState } from 'react'

interface PostFormProps {
  title: string
  setTitle: (title: string) => void
  body: string
  setBody: (body: string) => void
  onSubmit: (event: React.FormEvent) => void
  isLoading: boolean
}

export function PostForm({ title, setTitle, body, setBody, onSubmit, isLoading }: PostFormProps) {
  const [focused, setFocused] = useState(false)

  return (
    <section className="card">
      <div className="composer-header">
        <h2>What&apos;s an problem?</h2>
        <span className="anon-indicator">
          <img src="/assets/icons/user-x.svg" alt="" />
          posting anonymously
        </span>
      </div>
      <p className="section-hint">
        No name, no handle — nothing links this post to you, not even your other posts.
      </p>
      <form onSubmit={onSubmit} className="stack">
        <label className="field">
          <span>Title <span className="char-count">{title.length}/120</span></span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="One line — what's actually bothering you"
            maxLength={120}
            required
          />
        </label>
        {(focused || body || title) && (
          <label className="field">
            <span>Add details <span className="char-count">{body.length}/5000</span></span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Set the scene. No need to be tidy."
              maxLength={5000}
              rows={4}
              required
            />
          </label>
        )}
        <div className="composer-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading || !title.trim() || !body.trim()}
          >
            {isLoading ? 'Posting…' : 'Post anonymously'}
          </button>
        </div>
      </form>
    </section>
  )
}
