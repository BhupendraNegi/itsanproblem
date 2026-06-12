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

- [x] **Email digest** — `DigestJob` (Solid Queue recurring, 8am daily) emails each opted-in
  user their unread, not-yet-emailed notifications via `DigestMailer` (HTML + text), then stamps
  them `digested_at` so nothing is sent twice. Opt-out lives in Settings → Notifications
  (`users.email_digest_enabled`). Dev mail is written to `backend/tmp/mails/` (`:file`
  delivery); production SMTP is env-driven and no-ops until `SMTP_ADDRESS` is set.
- [x] **6b. Usernames** — unique `@username` per user (auto-derived from the name at signup,
  optionally chosen, editable in Settings); profile URLs are `/users/:username` instead of
  numeric ids (old id links still resolve). Shown on profiles, comment links, and the admin
  user list.
- [x] **6. User profile, expanded** — `bio` shown on the profile page; on **your own** profile,
  a "Your posts" list shows your anonymous posts with their handles, hidden status, and counts
  (resolved through the `post_authors` ledger, visible to no one else). Editing happens in
  Settings (#7).
- [x] **7. Settings** — `/settings` page with three sections: **profile** (name, email, bio →
  `PATCH /profile`), **password** (current password required, verified via Devise
  `valid_password?` → `PATCH /profile/password`), and **appearance** (Light / Dark / System
  theme, persisted as `themePref`; dark mode now keys off `data-theme` instead of the media
  query, with an inline pre-resolve script in `index.html` to avoid a flash).
- [x] **8. Admin role & moderation** — `role` on users (`member`/`moderator`/`admin`) with
  [ActionPolicy](https://actionpolicy.evilmartians.io) (deny-by-default policies, 403 on
  violation). Shipped under `/api/v1/admin/*` + an `/admin` SPA page (header link and route
  gated on role; seeded admin: `admin@itsanproblem.test`):
  - **Moderation queue** — flagged posts/comments with reason tallies and hidden status;
    restore (unhide + clear flags) or delete permanently.
  - **User management** — list/search users, promote/demote admins, delete accounts
    (admins can't change their own role or delete themselves).
  - **Impersonation** — issues a JWT for the target with an `impersonator_id` claim and writes
    an `impersonations` audit row (who, whom, when); the SPA switches session and returns to
    the feed, showing a persistent warning banner with a "Stop impersonating" button that
    restores the original staff session.
  - **Moderator role** — gets the dashboard, content moderation, and impersonation of
    *members only*; role changes and user deletion stay admin-only (a moderator can never
    mint an admin). Seeded: `moderator@itsanproblem.test`.
  - **Site stats** — users / posts / comments / flags / hidden-content totals.
  - Still open: account deactivation (soft suspend) as a gentler option than deletion.

## P0.1 — polish & gaps (shipped June 2026)

Things I'd want fixed before showing this to a stranger — found by using the product, not by
adding scope.

### Holes in the core loop

- [x] **1. Post detail page** (`/posts/:id`) — the biggest UX hole: posts aren't clickable.
  The feed clamps bodies to 3 lines with no way to read the rest, and `GET /api/v1/posts/:id`
  already exists but nothing in the SPA uses it. One page: full body, all replies, the same
  helpful/flag/reply actions. Everything below that needs a "go to the post" link depends on it.
- [x] **2. Clickable notifications** — bell items are plain text; "someone replied to your
  post" should navigate to that post (needs #1). Also show the unread count in the document
  title ("(2) it's an problem.") so a background tab is worth noticing.
- [x] **3. Flag a comment** — the backend supports it (`POST /comments/:id/flag`, auto-hide,
  moderation queue all work) but the UI only lets you flag posts. Bad replies are the likelier
  abuse target. Small flag affordance on each comment, same reason picker.
- [x] **4. "Posted as anon_xxxx" feedback** — after posting, tell the author their handle for
  that thread ("Posted anonymously as anon_a91f") so handles feel like a feature, not a mystery.

### Trust & safety plumbing (cheap now, painful later)

- [x] **5. Content length limits** — posts and comments currently have **no max length**; a
  10MB body is a valid record. Backend validations (title ≤ 120, body ≤ 5000, comment ≤ 2000,
  bio ≤ 300) + matching counters on the composer.
- [x] **6. Rate limiting** — `rack-attack` is in the Gemfile but has **no initializer**; it does
  nothing. Throttle login attempts per email/IP and post/comment creation per user — an
  anonymous board without this is a spam magnet on day one.
- [x] **7. Forgot password** — Devise `recoverable` is enabled and the mailer infra now exists,
  but there's no reset flow. "Forgot password?" link → reset email → set new password. Without
  it, a forgotten password = a lost (anonymous) account nobody can recover.
- [x] **8. Delete my account** — only admins can delete users; there's no self-service. Danger
  zone in Settings (password required): deletes the account and authored posts, same as the
  admin path. (Related: the still-open admin "deactivate" soft-suspend.)

### Small fit & finish

- [x] **9. Feed pagination** — `GET /posts` returns every post in the database; fine at 5,
  dead at 5000. Simple `?page=` + a "Load more" button.
- [x] **10. Loading skeletons & empty states** — the feed shows a bare "Loading…" string and a
  brand-new instance shows nothing inviting. Card-shaped skeletons + a friendly "no posts yet —
  be the first" empty state.
- [x] **11. Honest password hint** — the register form says "At least 8 characters" but Devise
  accepts 6. Align (raise Devise to 8) and show the rule as a field hint, not just a placeholder.
- [x] **12. Remember the feed sort** — Recent/Hot resets to Recent on every visit; persist the
  choice like `themePref`.
- [x] **13. Per-user avatar colors** — every avatar is the same gradient, so every face looks
  identical. Derive a stable hue from the username so people are tellable-apart at a glance.
- [x] **14. Silence the admin 403s** — an impersonated/non-staff session briefly mounts
  `/admin` and fires three queries that 403 before the redirect (seen during mobile
  verification). Gate the queries with `enabled: isStaff`.

## Anonymity model v2 (shipped June 2026)

Reworked after review: anonymity should look like the *absence* of identity, not an alternate
identity.

- [x] **No handles in the UI** — posts show a neutral mask + "Anonymous" everywhere; `anon_handle`
  stays internal (ledger/uniqueness) and is no longer in any API response.
- [x] **OP badge** — the post author's replies render as "Anonymous" with an **OP** badge instead
  of a pseudonym.
- [x] **Anonymous replies (opt-in)** — "Reply anonymously" checkbox per reply; identity hidden in
  the UI, `user_id` still recorded for moderation; **no helpful points** for anonymous replies so
  reputation stays tied to signed advice.
- [x] **v3: posts get the choice too (founder call)** — posts are **named by default** with a
  "Post anonymously" toggle; existing posts were backfilled anonymous (they were created under
  the always-anonymous promise). Named posts show the author with a profile link; public
  profiles list a user's named posts; the OP badge appears on the author's replies either way
  (identity hidden only when the post itself is anonymous).
- [x] **Copy aligned** — auth intro/footnote, navbar subtitle ("Anonymous problems, honest
  advice"), composer hint ("No name, no handle — nothing links this post to you"), and the
  post-success message.

## Next — P1, the founder thesis

Don't start until the P0 loop works end to end.

- [ ] **Friend graph** (~1 week) — add friends by email/username, mutual confirmation, friend
  count visible only to the user. `friendships` table.
- [ ] **Friend-anon posts** (~1 week) — "share with friends only" toggle; OP still anonymous
  within the group. Hard floor of **5 friends** (below that the toggle is disabled — smaller
  groups leak identity by arithmetic). `audiences` table + `min_audience` enforcement.
- [x] **Tags & rooms** — six seeded rooms (academic, relationships, money, mental-health,
  housing, career); optional single tag per post (`posts.tag_id` — simpler than the planned
  `post_tags` join for one-tag-per-post), `GET /posts?tag=slug` filtered feeds with shareable
  URLs, room chips + sidebar room list, tag chips on cards, and a crisis-support banner on the
  mental-health room (from the risk list).
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
