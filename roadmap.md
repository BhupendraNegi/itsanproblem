# Roadmap

Derived from [roadmap.html](roadmap.html) / [roadmap-print.html](roadmap-print.html) (May 2026),
reconciled against the actual code as of June 2026. Checked items are verified in the repo, not
just claimed.

## Where we are today

Shipped since the original roadmap was written:

- [x] **Tests + CI** — the "zero tests" risk is closed: RSpec request specs cover auth, posts,
  comments, and users ([backend/spec/requests/api/v1/](backend/spec/requests/api/v1/)), and CI runs
  RSpec, StandardRB, Brakeman, ESLint, Vitest, tsc, markdownlint, bundler-audit, and Gitleaks
  ([.github/workflows/](.github/workflows/)).
- [x] **Profile pages** — `GET /api/v1/users/:id` ([users_controller.rb](backend/app/controllers/api/v1/users_controller.rb))
  and [ProfilePage.tsx](frontend/src/pages/ProfilePage.tsx): name, helpful points, comment count,
  recent comments. Anonymous posts hidden by design.
- [x] `user_stats` table (`helpful_points`, `comment_count`), lazily created via `UserStat.for_user`.
- [x] **Design system** — Instagram-style theme with automatic dark/light mode
  ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), [App.css](frontend/src/App.css)).
- [x] **Dev/deploy infrastructure** — Docker stack (Postgres + Valkey), SOPS secrets, `bin/setup`,
  `bin/dev`, `bin/lint`, `bin/audit`.
- [x] Seed data for local dev (demo user, posts, comments).

## Now — P0, finish the core loop

All five P0 items shipped (June 2026):

- [x] **1. Helpful marks** — polymorphic `helpful_marks` table (unique on `[user, markable]`),
  toggle endpoints (`POST/DELETE /posts/:id/helpful_mark`, same for comments), `helpful_count` +
  `viewer_marked` in JSON, PostCard button and per-comment button wired. Reputation rule applied:
  **only the OP's mark on a comment feeds the commenter's `helpful_points`**
  ([HelpfulMark](backend/app/models/helpful_mark.rb)); crowd marks count for sorting only.
- [x] **2. Recent vs Hot filter** — `?sort=hot` on `GET /posts` (helpful marks desc within the
  last 7 days, `Post.hot`); segmented Recent/Hot control on the feed.
- [x] **3. Stable anon handles + structural anonymity** — every post gets a stable `anon_handle`
  (`anon_a91f`); the OP's replies in their own thread show the handle instead of their name
  (`author_id: null`). The privacy footgun is fixed: **`posts.user_id` is dropped**; authorship
  lives in the separate `post_authors` ledger ([PostAuthor](backend/app/models/post_author.rb)).
- [x] **4. Flag / report** — `flags` table with reason picker (harm, spam, identifying info),
  idempotent per user; **3 distinct flags auto-hide** the post/comment (`hidden_at`), excluded
  from all API output pending review ([Flag](backend/app/models/flag.rb)).
- [x] **5. Notifications (in-app)** — bell in the header with unread badge + dropdown, polling
  every 30s; events: "someone replied to your post" and "your reply earned a helpful mark";
  `GET /notifications`, `PATCH /notifications/read_all`. Email digest still to come (below).

Remaining from P0 scope:

- [ ] **Email digest** — ActionMailer + digest job for the same two notification events.

## Next — P1, the founder thesis

Don't start until the P0 loop works end to end.

- [ ] **Friend graph** (~1 week) — add friends by email/username, mutual confirmation, friend
  count visible only to the user. `friendships` table.
- [ ] **Friend-anon posts** (~1 week) — "share with friends only" toggle; OP still anonymous
  within the group. Hard floor of **5 friends** (below that the toggle is disabled — smaller
  groups leak identity by arithmetic). `audiences` table + `min_audience` enforcement.
- [ ] **Tags & rooms** (~3 days) — six seed tags (academic, relationships, money, mental-health,
  housing, career), one tag per post, tag-filtered feeds. `tags` + `post_tags`.
- [ ] **College verification** (~3 days) — `.edu` domain match on signup → verified-campus badge
  and a campus-only feed. `colleges` table.
- [ ] **Badges** (~2 days) — auto-awarded profile chips ("honest neighbor", "first post",
  "10 marked helpful"). `user_stats.badges` JSON + a recurring job.
- [ ] **Search** (~2 days) — title + body search. Postgres `pg_trgm` + GIN index; no
  Elasticsearch. (Note: local dev is SQLite — gate the trigram path by adapter or use `LIKE`
  locally.)

## Later — P2, only after traction

Deliberately not started; need real users and data first.

- [ ] **AI advisor** — RAG/fine-tune over comments with ≥ N helpful marks; needs 10k+
  helpful-marked replies, a safety filter, and evals first.
- [ ] **Premium tier** — Stripe, drafts, advanced filters. Only after the free product retains.
- [ ] **University partnerships** — anonymized aggregate insights for student services; needs
  k-anonymity guarantees and legal review.
- [ ] **Mobile app** — PWA first; native only if push engagement demands it.
- [ ] **Audio "vents"** — voice posts with auto-transcription; expensive, off the critical path.
- [ ] **Memes / image posts** — wait until flags + a real mod queue exist; images raise the
  moderation burden sharply.

## Open questions for the founder (blocking P1)

1. **First-100-users strategy** — recommendation: pick one campus, seed it with ~50 real
   problems, don't open public registration until that campus retains.
2. **Friend-group anonymity floor** — recommendation: hard floor of 5 friends for friend-anon
   posts; no UX workaround exists for the small-group identity leak.
3. **AI training data quality** — recommendation: no AI until a separate annotation layer exists;
   "helpful" ≠ "correct."
4. **Monetization** — recommendation: college site licenses first; premium individual as fallback;
   no ads.
5. **Canonical name** — repo says `itsanproblem`, design system says "It's An Problem." Pick one
   name + one shorthand + one domain.

## Standing risks

- **Wrong advice will hurt people** — crisis-keyword detector → static safety banner before any
  mental-health-adjacent tag ships.
- **Friend-anon can be weaponized** — recipient-controlled visibility for friend-anon feedback.
- **Helpful marks ≠ helpful comments** — mitigated by the OP-mark reputation rule in P0 #1.
- **Cold start** — seed manually before any public launch; single-campus wedge.
