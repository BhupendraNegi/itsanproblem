# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

itsanproblem is a problem-sharing platform with per-item anonymity: posts and replies carry the author's name by default, with an opt-in anonymous mode on both (no name, no handle, no profile link). It is a split monorepo: a Rails 8 API in [backend/](backend/) and a React + TypeScript SPA in [frontend/](frontend/). The two communicate over a JSON API under `/api/v1`.

## Keeping this file current (read first)

**When you make an architectural change, update this file in the same commit as the code.** CLAUDE.md is the first thing the agent reads each session — stale guidance is worse than none. README.md is user-facing; this file is the contributor/agent map.

What counts as an architectural change, and which section to edit:

| Change | Section to update |
|--------|-------------------|
| New/removed service, port, container, or env var | **Commands › Full stack via Docker** |
| New `bin/` entry point or top-level command | **Commands** (the matching subsection) |
| Auth flow, JSON serialization, or error-shape convention | **Architecture › Backend** |
| New model or changed association | **Architecture › Backend** (data-model line) |
| New frontend state/store/data-fetching/routing pattern | **Architecture › Frontend** |
| Dependency swap that changes how code is built/run/linted (e.g. RuboCop→StandardRB, SQLite→Postgres) | the relevant section **+ Conventions & gotchas** |
| A new non-obvious constraint or footgun | **Conventions & gotchas** |

How: edit the **most specific existing section** (don't append a changelog or a dated entry), keep it to *what + why* (not a step-by-step history), link files as `[path](path)`, and **delete anything the change made untrue**. Code and its doc update land together — never one without the other. After editing, `bin/lint md` must stay green.

## Commands

### Backend (run from `backend/`)

- Install: `bundle install`
- DB setup: `bundle exec rails db:migrate` (development uses SQLite)
- Run server: `bundle exec rails server` (port 3000)
- All tests: `bundle exec rspec`
- Single test file: `bundle exec rspec spec/requests/api/v1/posts_spec.rb`
- Single example: `bundle exec rspec spec/path/to_spec.rb:42`
- Lint: `bin/standardrb` (Ruby Standard style; `--fix` to autocorrect)
- Security scan: `bundle exec brakeman`
- Dependency CVE scan: `bundle exec bundler-audit check --update`

### Linting & security (monorepo, run from repo root)

Two aggregator scripts run the same checks CI does; both delegate to the backend
gems via `mise exec` when mise is present.

- **`bin/lint`** — runs every linter and reports all (exits non-zero if any fail):
  - `bin/lint` — StandardRB (backend) + ESLint (frontend) + markdownlint (docs)
  - `bin/lint fix` — autocorrect all three
  - `bin/lint rb|js|md [args]` — run a single linter; extra args pass through (e.g. `bin/lint rb app/models`)
- **`bin/audit`** — `bundler-audit check --update` (dependency CVEs vs ruby-advisory-db) + Brakeman (Rails static analysis). bundler-audit is a **blocking** gate: fix flagged gems with `bundle update <gem>` rather than ignoring; [backend/.bundler-audit.yml](backend/.bundler-audit.yml) is for justified, commented exceptions only.

Config files: [.markdownlint-cli2.jsonc](.markdownlint-cli2.jsonc) (MD040/MD060 disabled for the legacy-doc backlog) and [.gitleaks.toml](.gitleaks.toml) (allowlists the SOPS-encrypted `secrets/*.yml`, `.sops.yaml`, and Rails-generated initializers — Devise's commented default `secret_key` is a known false positive).

### CI ([.github/workflows/](.github/workflows/))

Run on every push to `main` + all PRs:

- `lint.yml` — markdownlint · `security.yml` — bundler-audit + Gitleaks (full-history secret scan)
- `backend-ci.yml` — StandardRB + Brakeman · `frontend-ci.yml` — Vitest + `tsc --noEmit` + ESLint · `rspec.yml` — RSpec
- `dependabot.yml` — daily bundler / npm / github-actions update PRs

### Frontend (run from `frontend/`)

- Install: `npm install`
- Dev server: `npm run dev` (port 3001, proxies `/api` → `http://127.0.0.1:3000`; the target is overridable via `VITE_API_PROXY_TARGET`, set to `http://backend:3000` in the Docker stack — see [vite.config.ts](frontend/vite.config.ts))
- Build: `npm run build` (`tsc -b && vite build`)
- All tests: `npm test` (Vitest, single run); watch with `npm run test:watch`
- Single test file: `npx vitest run src/__tests__/components/PostCard.test.tsx`
- Coverage: `npm run test:coverage`
- Lint: `npm run lint` (ESLint)

### Local dev, both processes at once

- **`bin/dev`** runs the Rails backend (:3000, SQLite) and Vite frontend (:3001) together via overmind/foreman + [Procfile.dev](Procfile.dev). It loads `secrets/development.yml` (JWT_SECRET_KEY etc.), clears a stale Puma pidfile, and runs `db:prepare`. This is **local, non-container** dev — distinct from the Docker stack below.

### Full stack via Docker

- **`bin/setup`** is the single idempotent bootstrap entry point (modeled on a larger reference project): an ordered subcommand walk (`bin/setup install-docker`, etc.), a `--check` dry-run, a read-only `doctor`, and per-step logs in `tmp/setup-logs/`. It pins the toolchain via `mise` ([mise.toml](mise.toml)).
- **`bin/docker`** is the container lifecycle delegate: `setup` (installs + starts the **colima `itsaprom`** profile on macOS), `up`, `down`, `restart`, `logs`, `ps`, `build`, `clean`. It loads `secrets/development.yml` via [bin/_sops_env.sh](bin/_sops_env.sh) and injects the secrets into the containers.
- The stack ([docker-compose.yml](docker-compose.yml)) runs **PostgreSQL** + **Valkey** (Redis-compatible) + backend (3000) + frontend (3001). **Docker uses PostgreSQL while local development uses SQLite**: [backend/config/database.yml](backend/config/database.yml) is env-driven — when `DATABASE_URL` is set (Docker), it uses the `pg` adapter; otherwise it falls back to SQLite. Production routes `solid_cache`/`solid_queue`/`solid_cable` to the same Postgres database.
- **`postgres:latest` is v18+**, which stores data in a major-version subdir; the compose volume mounts at `/var/lib/postgresql` (not `.../data`).
- **Secrets:** two SOPS-encrypted envs only — `secrets/development.yml` and `secrets/production.yml` — encrypted for the age recipients in [.sops.yaml](.sops.yaml) (key at `~/.config/sops/age/keys.txt`). Nested keys flatten to `UPPERCASE_UNDERSCORE` env vars (e.g. `jwt.secret_key` → `JWT_SECRET_KEY`).

## Architecture

### Backend (Rails 8 API-only)

- All endpoints live under the `api/v1` namespace ([config/routes.rb](backend/config/routes.rb)); controllers are in [app/controllers/api/v1/](backend/app/controllers/api/v1/) and inherit from `ActionController::API`.
- **Authentication is hand-rolled JWT, not Devise's session/JWT flow.** [ApplicationController](backend/app/controllers/application_controller.rb) implements `authenticate_user!`, `encode_token`, and `decode_token` directly. Tokens are HS256, expire in 24h, and are signed with `ENV["JWT_SECRET_KEY"]` falling back to `Rails.application.secret_key_base`. Clients send `Authorization: Bearer <token>`. Devise is still used by the `User` model for password hashing/validation (`valid_password?`, `find_for_database_authentication`), and the `devise-jwt` gem is present but unused by the request auth path. **rack-attack is active** ([config/initializers/rack_attack.rb](backend/config/initializers/rack_attack.rb)): per-IP throttles on login/register/posts/comments, JSON 429s, disabled in test. Password reset is hand-rolled over Devise's token generator (`POST /auth/forgot_password` → emailed 6-hour link → `POST /auth/reset_password`); self-service deletion is `DELETE /profile` (password required). Devise password minimum is 8.
- **Authorization is ActionPolicy** ([app/policies/](backend/app/policies/)): `ApplicationPolicy` denies by default; `ActionPolicy::Unauthorized` renders 403. Users have a string-enum `role` (`member`/`moderator`/`admin`; `User#staff?` = moderator or admin). The `/api/v1/admin/*` namespace ([Admin::BaseController](backend/app/controllers/api/v1/admin/base_controller.rb)) gates on `AdminPolicy#access?` (any staff) and offers: moderation queue (`GET admin/flags`), restore/delete for posts and comments, user management (list/search, `PATCH .../role`, delete), site stats, and **impersonation** (`POST admin/users/:id/impersonate` issues a JWT for the target with an `impersonator_id` claim and writes an [Impersonation](backend/app/models/impersonation.rb) audit row). Moderators get the dashboard, content moderation, and impersonation of **members only** ([UserPolicy](backend/app/policies/user_policy.rb)); role changes and user deletion are admin-only, so a moderator can never mint an admin. Admins cannot change their own role, delete, or impersonate themselves. Account self-service lives at `PATCH /profile` and `PATCH /profile/password` (current password required). **Users have unique `username`s** (lowercase `a-z0-9_`, 3–20 chars, never all digits; auto-derived from the name via `User.generate_username` when not chosen at signup, editable in Settings). Public profile URLs are `/users/:username` — `GET /api/v1/users/:id` looks up by username first and falls back to numeric id for old links (unambiguous because usernames can't be all digits). Comment JSON exposes `author_username` for profile links.
- **JSON serialization is done via model `as_json` overrides**, not Blueprinter (the gem is in the Gemfile but unused). **Posts and comments are named by default with per-item opt-in anonymity** (`posts.anonymous`, `comments.anonymous`; existing pre-choice posts were backfilled anonymous). [Post#as_json](backend/app/models/post.rb) exposes `author`/`author_id`/`author_username` on named posts and `"Anonymous"` with null ids on anonymous ones; **anon handles are never exposed in JSON**. [Comment#as_json](backend/app/models/comment.rb) hides identity when the reply is anonymous **or** when the OP replies on their own *anonymous* post; OP replies always carry `"op": true` (badged "OP" in the UI). Authorship is always recorded server-side regardless. Public profiles list a user's *named* posts; your own profile lists all of yours. Both accept a `viewer:` option (populated via `set_current_user`, the optional-auth counterpart of `authenticate_user!`) to compute `viewer_marked`. When changing post output, preserve the Anonymous override.
- **Anonymity is structural, not cosmetic:** `posts` has **no `user_id` column**. Authorship lives in the separate `post_authors` ledger ([PostAuthor](backend/app/models/post_author.rb)); `User has_many :posts, through: :post_authors` (so `user.posts.create!` still works) and `Post#author_user_id` resolves the author. Each post gets a stable `anon_handle` (`anon_xxxx`) at creation.
- Data model: `User` has many `posts` (through `post_authors`), `comments`, `notifications`, and one `user_stat`; `Post` and `Comment` both have polymorphic `helpful_marks` and `flags`. `UserStat` tracks `helpful_points` and `comment_count`, lazily created via `UserStat.for_user`. **Reputation rule:** only the OP's helpful mark on a comment awards a point, and **anonymous replies earn no points** ([HelpfulMark](backend/app/models/helpful_mark.rb)); crowd marks count for sorting only. [Flag](backend/app/models/flag.rb) auto-hides content (sets `hidden_at`) at 3 distinct user flags; hidden posts/comments are excluded everywhere via `Post.visible` / `reject(&:hidden_at)`. [Notification](backend/app/models/notification.rb) records `reply` and `helpful_mark` events via model callbacks; served by `GET /notifications` and `PATCH /notifications/read_all`. [DigestJob](backend/app/jobs/digest_job.rb) (Solid Queue recurring, 8am daily in [config/recurring.yml](backend/config/recurring.yml)) emails each opted-in user their `pending_digest` notifications (unread + not yet emailed, then stamped `digested_at`) via [DigestMailer](backend/app/mailers/digest_mailer.rb); users opt out with `email_digest_enabled` (Settings → Notifications). Development mail uses `:file` delivery into `backend/tmp/mails/`; production SMTP is env-driven (`SMTP_ADDRESS`/`SMTP_PORT`/`SMTP_USER_NAME`/`SMTP_PASSWORD`, plus `MAIL_FROM`, `APP_URL`, `APP_HOST`) and silently no-ops when `SMTP_ADDRESS` is unset. `GET /posts?sort=hot` ranks by helpful marks in the last 7 days (`Post.hot`); the index paginates at 10/page via `?page=N` (the SPA's `usePosts` is an infinite query with Load more).
- CORS ([config/initializers/cors.rb](backend/config/initializers/cors.rb)) is wide open (`origins "*"`) — intended for development.
- Solid Queue / Solid Cache / Solid Cable are configured; Sidekiq + Redis and Sentry gems are also present. The Docker stack provides a Valkey (Redis-compatible) service exposed as `REDIS_URL` for the sidekiq/redis gems, though the core path uses the `solid_*` adapters.

### Frontend (React 19 + Vite + TypeScript)

- **Server state vs. client state are deliberately separated.** TanStack React Query owns all API data; all queries and mutations are centralized in [src/hooks/useMutations.ts](frontend/src/hooks/useMutations.ts) (`usePosts(sort)`, `useUserProfile`, `useNotifications` — polls every 30s, `useAuthMutation`, `usePostMutation`, `useCommentMutation`, `useHelpfulMutation`, `useFlagMutation`, `useReadAllNotifications`). Mutations invalidate the `['posts']` (or `['notifications']`) query key to refresh. Auth state (current user + token) lives in a Zustand store ([src/store.ts](frontend/src/store.ts)) and is persisted to `localStorage` (`authUser`, `authToken`).
- All HTTP goes through [src/api.ts](frontend/src/api.ts), a single axios instance with `baseURL: '/api/v1'` and a request interceptor that injects the bearer token from `localStorage`. Add new endpoints here.
- Routing is React Router; [src/App.tsx](frontend/src/App.tsx) holds the main feed and most local form state (`useState`). Other routes: `ProfilePage` (`/users/:id` — includes a self-only "Your posts" list), `SettingsPage` (`/settings` — profile, password, theme), and `AdminPage` (`/admin` — stats, moderation queue, user management + impersonation; redirects non-staff; the Header's navigation lives in a user dropdown — Profile / Admin (staff only) / Settings / Log out — next to the notification bell, and the navbar wordmark uses the same `--gradient-brand` text treatment as the footer). Impersonation keeps the original staff session in the auth store (`impersonator`, persisted to localStorage) and shows a fixed amber `ImpersonationBanner` above the navbar (`body.impersonating` shifts the layout) with a Stop button that restores the staff session and clears the React Query cache.
- **Tests use MSW** ([src/mocks/](frontend/src/mocks/)) to mock the API at the network layer; `onUnhandledRequest: 'error'` ([src/test/setup.ts](frontend/src/test/setup.ts)) means any un-mocked request fails the test. Use [src/test/renderWithProviders.tsx](frontend/src/test/renderWithProviders.tsx) to wrap components with the Query/Router providers.
- **Styling is a hand-rolled CSS design system in [src/App.css](frontend/src/App.css)** (not Tailwind, despite older docs) — design tokens as CSS custom properties on `:root`, referenced by component class names. The palette is **Instagram-style**: an Instagram blue (`--primary`) for buttons, a pink (`--accent`) for likes/active states, the signature multicolor gradient (`--gradient-brand`) on avatars and the footer wordmark, and a chrome gradient (`--gradient-chrome`) on the nav bar and footer that **flips per theme** — dark in light mode, white→grey in dark mode — with `--chrome-fg/-surface/-border/-icon-filter` tokens flipping alongside it; the navbar dropdown carries a Light/Dark/Auto theme picker as its first row. `#root` is a flex column and the footer uses `margin-top: auto`, so it sits at the viewport bottom on short pages (login) without being fixed. **Dark mode is driven by a `data-theme` attribute on `<html>`**, not a media query: the theme store in [src/store.ts](frontend/src/store.ts) (`useTheme`, persisted as `themePref` in localStorage) resolves a Light / Dark / System preference — System follows `prefers-color-scheme` — and a static [public/theme-init.js](frontend/public/theme-init.js) (loaded from [index.html](frontend/index.html)) pre-resolves it before React mounts to avoid a flash. Dark token overrides live under `:root[data-theme="dark"]` (which also inverts content-area line icons); the preference is changed on the Settings page. When styling, add/extend semantic tokens rather than hardcoding colors so both themes stay correct, and **no inline `style={{}}` in components** — every visual rule lives in App.css as a class; all pages share the `.app-shell` content width (max 1400px), same as the feed. Global chrome: [Header.tsx](frontend/src/components/Header.tsx) (nav) and [Footer.tsx](frontend/src/components/Footer.tsx) (rendered once in [App.tsx](frontend/src/App.tsx)). See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

## Conventions & gotchas

- **Ruby version mismatch:** the repo targets Ruby **4.0.3** ([.ruby-version](backend/.ruby-version), Gemfile), but StandardRB's analyzer (RuboCop's parser) does not yet support Ruby 4.0, so `ruby_version` is pinned to **3.3** in [.standard.yml](backend/.standard.yml).
- Error responses use a consistent shape: `{ error: "..." }` for single messages, `{ errors: [...] }` (from `model.errors.full_messages`) for validation failures, with `422 :unprocessable_content` for invalid input and `401 :unauthorized` for auth failures.
- API param wrapping: posts are sent as `{ post: {...} }`, comments as `{ comment: {...} }`, auth as `{ user: {...} }`. The frontend camelCase `passwordConfirmation` is mapped to `password_confirmation` in [src/api.ts](frontend/src/api.ts).

- **Explicit `git add`, never `git add -A` / `git add .`.** Parallel work is often pre-staged in the index; a global add sweeps it into your commit. Prefer `git commit -m "..." -- <paths>` to commit only specific files without touching the index.
