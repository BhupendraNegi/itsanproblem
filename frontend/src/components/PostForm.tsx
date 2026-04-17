interface PostFormProps {
  title: string
  setTitle: (title: string) => void
  body: string
  setBody: (body: string) => void
  onSubmit: (event: React.FormEvent) => void
  isLoading: boolean
}

export function PostForm({ title, setTitle, body, setBody, onSubmit, isLoading }: PostFormProps) {
  return (
    <section className="form-card">
      <h2>Create a new anonymous post</h2>
      <form onSubmit={onSubmit} className="stack">
        <label>
          Title
          <input value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>
        <label>
          Problem details
          <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={4} required />
        </label>
        <button type="submit" className="primary-button" disabled={isLoading}>
          {isLoading ? 'Posting...' : 'Post anonymously'}
        </button>
      </form>
    </section>
  )
}
