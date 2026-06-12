import { Breadcrumbs } from '../components/Breadcrumbs'

export function PrivacyPage() {
  return (
    <main className="app-shell info-page">
      <Breadcrumbs items={[{ label: 'Privacy' }]} />
      <h1 className="page-title">Privacy</h1>
      <p className="section-hint">Plain language, because that's the point of this site.</p>

      <section className="card info-prose">
        <h2 className="section-title">What we store</h2>
        <p>
          Your account (name, username, email, encrypted password, bio), everything you post and
          reply, your helpful marks, your flags, and your notifications. Passwords are hashed —
          we can't read them.
        </p>
      </section>

      <section className="card info-prose">
        <h2 className="section-title">What anonymity does — and doesn't — mean</h2>
        <p>
          Anonymous content shows <strong>no identity to anyone using the site</strong>: no name,
          no handle, no profile link, and no way to connect it to your other activity.
        </p>
        <p>
          Honest part: authorship is still recorded <strong>in our database</strong>. We keep it
          deliberately separated from the content, but it exists — it's what makes moderation
          possible (banning someone who posts abuse anonymously), powers your private "Your posts"
          list, and lets us respond to valid legal requests. Anonymity protects you from other
          users; it is not invisibility from the service itself.
        </p>
      </section>

      <section className="card info-prose">
        <h2 className="section-title">Emails</h2>
        <p>
          We email you for two reasons: a daily digest of your notifications (opt out anytime in
          Settings → Notifications) and password resets you request. No marketing, no sharing your
          address.
        </p>
      </section>

      <section className="card info-prose">
        <h2 className="section-title">What lives in your browser</h2>
        <p>
          We use localStorage, not tracking cookies: your sign-in token, your theme choice, and
          your feed-sort preference. Logging out clears the session. There are no third-party
          trackers and no ads.
        </p>
      </section>

      <section className="card info-prose">
        <h2 className="section-title">Deleting your data</h2>
        <p>
          Settings → Delete account removes your account, your posts (anonymous ones included),
          and your replies, permanently. We don't keep recoverable copies.
        </p>
      </section>

      <section className="card info-prose">
        <h2 className="section-title">What we'll never do</h2>
        <p>
          Sell your data, show you ads, or reveal who posted something anonymously to another
          user. If any of this policy changes, we'll say so here before it does.
        </p>
      </section>
    </main>
  )
}
