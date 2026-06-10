# itsanproblem

Either you can rant about a problem or you can do something about it.

An anonymous problem-sharing platform where users can post problems anonymously, and others can comment with their names.

## Features

- User registration and authentication
- Anonymous problem posts
- Named comments on posts
- Separate frontend (React + TypeScript) and backend (Rails API)

## Setup

### Prerequisites

- Ruby 4.0.3 (pinned in [mise.toml](mise.toml) / [backend/.ruby-version](backend/.ruby-version))
- Node.js 20
- SQLite (local dev); PostgreSQL is used by the Docker stack
- For the Docker stack on macOS: [colima](https://github.com/abiosoft/colima) (installed by `bin/docker setup`)
- For decrypting secrets: `sops`, `age`, `yq`, and an age key at `~/.config/sops/age/keys.txt`

### Quick start (recommended)

A single idempotent entry point bootstraps everything — toolchain (via `mise`),
the colima `itsaprom` runtime, dependencies, the container stack, and the
database:

```bash
bin/setup            # full bootstrap (re-runnable)
bin/setup --check    # dry-run: report what would change, mutate nothing
bin/setup doctor     # read-only health report
```

Once up: frontend → <http://localhost:5173>, backend → <http://localhost:3000/api/v1>

### Docker stack lifecycle

```bash
bin/docker setup     # one-time: install + start the colima 'itsaprom' VM (macOS)
bin/docker up        # build images + start db, valkey, backend, frontend
bin/docker ps        # status + health
bin/docker logs backend
bin/docker down      # stop (named volumes survive)
bin/docker clean -y  # DESTRUCTIVE: down + wipe db/valkey/bundle volumes
```

The stack runs **PostgreSQL** plus **Valkey** (Redis-compatible). Local
(non-Docker) development still uses **SQLite** — [backend/config/database.yml](backend/config/database.yml)
selects the adapter from `DATABASE_URL`, so no per-developer config is needed.

### Local development without Docker

Run **both** the backend (Rails, SQLite) and frontend (Vite) with a single
command via [bin/dev](bin/dev) (overmind/foreman + [Procfile.dev](Procfile.dev)):

```bash
bin/dev                      # backend :3000 + frontend :5173 together (Ctrl-C stops both)
BACKEND_PORT=4000 bin/dev    # override ports
```

Or run them separately:

```bash
# Backend (http://localhost:3000, SQLite)
cd backend && bundle install && bundle exec rails db:prepare && bundle exec rails server

# Frontend (http://localhost:5173)
cd frontend && npm install && npm run dev
```

**Seed data:** `cd backend && bundle exec rails db:seed` populates demo posts and
comments (idempotent; skipped in production). Log in with **`demo@itsanproblem.test`
/ `password123`** — see [backend/db/seeds.rb](backend/db/seeds.rb).

### Secrets (SOPS + age)

Environment secrets live in [secrets/development.yml](secrets/development.yml) and
[secrets/production.yml](secrets/production.yml), value-encrypted with SOPS for the
age recipients in [.sops.yaml](.sops.yaml). `bin/docker` decrypts development
secrets and injects them into the containers. Edit with `sops secrets/development.yml`.

## Linting & security

```bash
bin/lint     # StandardRB (backend) + ESLint (frontend) + markdownlint (docs)
bin/lint fix # autocorrect all of the above
bin/audit    # bundler-audit (dependency CVEs) + Brakeman (static analysis)
```

CI runs these on every push/PR via GitHub Actions:

- **Lint** — StandardRB, ESLint, TypeScript (`tsc`), markdownlint
- **Security** — Brakeman, bundler-audit, Gitleaks (secret scanning)
- **Tests** — RSpec (backend), Vitest (frontend)
- **Dependabot** — daily bundler / npm / github-actions updates

## API Endpoints

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/posts` - List all posts
- `POST /api/v1/posts` - Create anonymous post (requires auth)
- `POST /api/v1/posts/:id/comments` - Add comment to post (requires auth)

## TODO

🔒 environment & secrets

- use dotenv both in rails + react.

env vars:

- DATABASE_URL

- REDIS_URL

- SECRET_KEY_BASE

- STORAGE_BUCKET/S3 creds
