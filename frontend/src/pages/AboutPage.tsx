import { Breadcrumbs } from '../components/Breadcrumbs'

export function AboutPage() {
  return (
    <main className="app-shell info-page">
      <Breadcrumbs items={[{ label: 'About' }]} />
      <h1 className="page-title">About</h1>

      <section className="card info-prose">
        <h2 className="section-title">Why this exists</h2>
        <p>
          Everyone carries problems they never say out loud — not because the problems are rare,
          but because saying them feels risky. <em>What will people think?</em> So the burnout, the
          money stress, the loneliness in a new city stays private, and everyone quietly believes
          they're the only one.
        </p>
        <p>
          <strong>it's an problem</strong> exists to remove that risk. Post what's actually
          bothering you — with your name if you're comfortable, or fully anonymously when it
          matters. Either way, real people reply with what worked for them.
        </p>
      </section>

      <section className="card info-prose">
        <h2 className="section-title">How anonymity works here</h2>
        <p>
          When you post anonymously there is <strong>no name, no handle, and no profile link</strong> —
          not even a pseudonym. Nobody reading can connect an anonymous post to you, to your
          replies, or to your other posts. Your own anonymous posts are listed only on your own
          profile, visible only to you.
        </p>
        <p>
          Replies work the same way: they carry your name by default — advice means more when
          someone stands behind it — but any reply can be made anonymous too, for when sharing
          your own experience is the helpful thing and the experience is personal.
        </p>
      </section>

      <section className="card info-prose">
        <h2 className="section-title">Honest advice, rewarded</h2>
        <p>
          Reputation here isn't about being liked — it's about being useful. Only the person who
          posted the problem can award a helpful point, and only to a signed reply. The question
          we score is simple: <em>did you actually help the person you were talking to?</em>
        </p>
      </section>

      <section className="card info-prose">
        <h2 className="section-title">And the name?</h2>
        <p>
          "it's an problem" is grammatically wrong on purpose. Problems don't arrive polished, and
          you shouldn't have to polish them before asking for help. Say it messy. Someone here has
          been through it.
        </p>
      </section>
    </main>
  )
}
