import { Breadcrumbs } from '../components/Breadcrumbs'

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Is anonymous really anonymous?',
    a: "To everyone using the site, yes — an anonymous post or reply shows no name, no handle, no profile link, and nothing connects it to your other activity. One honest caveat: authorship is recorded in our database (kept separate from the content) so moderation works and you can find your own posts. Other users can never see it; site operators don't browse it.",
  },
  {
    q: "What's the difference between posting anonymously and just using a random username?",
    a: 'A username — even a made-up one — is a persistent identity: it links your profile, every reply, and every named post together, and over time that adds up to a recognizable person. An anonymous post links to nothing: not your profile, not your replies, not even your other anonymous posts. There is no thread for anyone to pull.',
  },
  {
    q: 'How do I find my own anonymous posts again?',
    a: 'Open your own profile — the "Your posts" list shows everything you\'ve written, with anonymous posts tagged. Only you can see that list. You\'ll also get a notification (and an optional daily email) whenever someone replies.',
  },
  {
    q: 'How do helpful points work?',
    a: "Anyone can mark a post or reply helpful, and those marks decide what trends in the Hot feed. But reputation points are stricter: only the original poster's mark on a reply awards a point — the system rewards actually helping the person who asked, not crowd applause.",
  },
  {
    q: "Why didn't my anonymous reply earn a point?",
    a: "By design: anonymous replies never earn reputation. Points are the reward for putting your name on advice. Going anonymous is always available when you need it — it just doesn't build your track record.",
  },
  {
    q: 'What does the OP badge mean?',
    a: "OP marks the original poster — the person whose problem the thread is about. On an anonymous post their replies stay anonymous with the badge; on a named post the badge appears next to their name. Either way you know when the asker is speaking.",
  },
  {
    q: 'What happens when something gets flagged?',
    a: 'Each flag records a reason (harmful, spam, or identifying info). Once three different people flag the same content it is hidden automatically, sight unseen, until a moderator reviews it — moderators can restore it or remove it permanently.',
  },
  {
    q: 'Can I delete my account?',
    a: 'Yes — Settings → Delete account, with your password to confirm. It permanently removes your account, your posts (anonymous ones included), and your replies. There is no undo and no retained copy.',
  },
  {
    q: 'Why is it called "it\'s an problem"?',
    a: "The broken grammar is the point. Problems don't arrive grammatically correct, and you shouldn't have to polish yours before asking for help. Post it messy.",
  },
  {
    q: 'Is this professional advice?',
    a: "No. Everything here is peer experience — valuable, but not a substitute for a doctor, lawyer, therapist, or financial advisor. If you're in crisis, please reach a professional or a local crisis line first.",
  },
]

export function FaqPage() {
  return (
    <main className="app-shell info-page">
      <Breadcrumbs items={[{ label: 'FAQ' }]} />
      <h1 className="page-title">Frequently asked questions</h1>

      <div className="faq-list">
        {FAQS.map(({ q, a }) => (
          <details key={q} className="card faq-item">
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </main>
  )
}
