import { Breadcrumbs } from '../components/Breadcrumbs'

export function HelpPage() {
  return (
    <main className="app-shell info-page">
      <Breadcrumbs items={[{ label: 'Help' }]} />
      <h1 className="page-title">Help</h1>

      <section className="card info-prose">
        <h2 className="section-title">Posting a problem</h2>
        <p>
          Use the composer at the top of the feed. Posts go out <strong>with your name by
          default</strong>; tick <em>Post anonymously</em> to remove your identity entirely.
          Titles are capped at 120 characters and bodies at 5,000 — enough to set the scene, no
          need to be tidy.
        </p>
        <p>
          Anonymous posts don't appear on your public profile. To find them again, open your own
          profile — the "Your posts" list (visible only to you) shows everything you've posted.
        </p>
      </section>

      <section className="card info-prose">
        <h2 className="section-title">Replying</h2>
        <p>
          Replies carry your name by default — that accountability is what makes advice here worth
          something. If your reply shares something personal, tick <em>Reply anonymously</em>
          before posting. Anonymous replies can't earn helpful points.
        </p>
        <p>
          The post's author shows up in their own thread with an <strong>OP</strong> badge, so you
          always know when the person who asked is talking.
        </p>
      </section>

      <section className="card info-prose">
        <h2 className="section-title">Helpful marks</h2>
        <p>
          The heart on a post or reply tells the author "this helped." Anyone's marks affect how
          content ranks in the <em>Hot</em> feed, but <strong>only the original poster's mark on a
          signed reply awards a reputation point</strong> — points mean you helped the person you
          were actually talking to.
        </p>
      </section>

      <section className="card info-prose">
        <h2 className="section-title">Reporting content</h2>
        <p>
          Every post and reply has a <em>Flag</em> action with three reasons: harmful, spam, or
          identifying info (calling out who an anonymous poster is will get a reply removed fast).
          Content flagged by three different people is hidden automatically until a moderator
          reviews it.
        </p>
      </section>

      <section className="card info-prose">
        <h2 className="section-title">Notifications</h2>
        <p>
          The bell shows two events: someone replied to your post, and your reply earned a helpful
          mark. If you're away, a daily email digest covers what you missed — turn it off in
          Settings → Notifications.
        </p>
      </section>

      <section className="card info-prose">
        <h2 className="section-title">Your account</h2>
        <p>
          Settings lets you change your name, username, email, bio, password, and theme. Forgot
          your password? Use the link on the sign-in page for an email reset. You can also delete
          your account from Settings — it removes your account, your posts, and your replies, and
          it cannot be undone.
        </p>
      </section>
    </main>
  )
}
