import { Breadcrumbs } from '../components/Breadcrumbs'

export function TermsPage() {
  return (
    <main className="app-shell info-page">
      <Breadcrumbs items={[{ label: 'Terms' }]} />
      <h1 className="page-title">Terms of use</h1>
      <p className="section-hint">The short version: be honest, be kind, don't unmask people.</p>

      <section className="card info-prose">
        <h2 className="section-title">1. What this service is</h2>
        <p>
          it's an problem is a peer-support community. People share problems — sometimes
          anonymously — and other people share what worked for them. By creating an account you
          agree to these terms.
        </p>
      </section>

      <section className="card info-prose">
        <h2 className="section-title">2. Not professional advice</h2>
        <p>
          Replies here are personal experience, not professional medical, legal, or financial
          advice. If you're in crisis or dealing with something serious, please talk to a
          qualified professional or a local crisis line — this community can support you, but it
          can't replace them.
        </p>
      </section>

      <section className="card info-prose">
        <h2 className="section-title">3. The rules</h2>
        <p>Don't use the service to:</p>
        <ul>
          <li>harass, threaten, or bully anyone — anonymity is for safety, not cruelty;</li>
          <li>guess at, reveal, or hint at who posted something anonymously ("identifying info" is a flaggable offense);</li>
          <li>post spam, scams, or advertising;</li>
          <li>post anything illegal or that infringes someone else's rights;</li>
          <li>attempt to break, overload, or probe the service.</li>
        </ul>
      </section>

      <section className="card info-prose">
        <h2 className="section-title">4. Moderation</h2>
        <p>
          Content flagged by three different people is hidden automatically pending review.
          Moderators may restore or permanently remove content, and admins may suspend or delete
          accounts that break these rules. Anonymity never shields rule-breaking — authorship is
          recorded server-side and moderation applies to anonymous content the same as named.
        </p>
      </section>

      <section className="card info-prose">
        <h2 className="section-title">5. Your content</h2>
        <p>
          You own what you write. By posting you give us the license needed to display it on the
          service. Deleting your account deletes your content; the "anonymous by design" promise
          on existing anonymous posts is never reversed.
        </p>
      </section>

      <section className="card info-prose">
        <h2 className="section-title">6. Changes & contact</h2>
        <p>
          The service is provided as-is while it grows. If these terms change in a way that
          matters, we'll announce it here. Questions? See the Help and FAQ pages first.
        </p>
      </section>
    </main>
  )
}
