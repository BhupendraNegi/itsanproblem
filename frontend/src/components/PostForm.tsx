import { useState } from 'react'

interface PostFormProps {
  title: string
  setTitle: (title: string) => void
  body: string
  setBody: (body: string) => void
  anonymous: boolean
  setAnonymous: (anonymous: boolean) => void
  onSubmit: (event: React.FormEvent) => void
  isLoading: boolean
}

export function PostForm({ title, setTitle, body, setBody, anonymous, setAnonymous, onSubmit, isLoading }: PostFormProps) {
  const [focused, setFocused] = useState(false)

  return (
    <section className="card">
      <div className="composer-header">
        <h2>What&apos;s an problem?</h2>
        <span className="anon-indicator">
          <img src={anonymous ? '/assets/icons/user-x.svg' : '/assets/icons/user.svg'} alt="" />
          {anonymous ? 'posting anonymously' : 'posting as you'}
        </span>
      </div>
      <p className="section-hint">
        {anonymous
          ? 'No name, no handle — nothing links this post to you, not even your other posts.'
          : 'Your name and profile will be on this post. Tick the box below to go anonymous.'}
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
          <label className="checkbox-row reply-anon-toggle">
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
            Post anonymously
          </label>
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading || !title.trim() || !body.trim()}
          >
            {isLoading ? 'Posting…' : (anonymous ? 'Post anonymously' : 'Post')}
          </button>
        </div>
      </form>
    </section>
  )
}
