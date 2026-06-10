# Dockerization & `bin/setup` Plan

> Status: **proposal — for review**. Nothing in here is implemented yet.
> Once you approve (or amend) the decisions at the bottom, we implement in the
> order under "Rollout".

This document explains how I'll bring itsanproblem's container setup and
first-time bootstrap up to the standard of the `code` project's
[`bin/setup`](/opt/apps/dev/code/bin/setup), adapted to this repo's smaller
stack (Rails 8 API + React SPA, monorepo).

---

## 1. What I studied in `code`

`code/bin/setup` is a **single idempotent bash entry point** with these traits
worth copying:

- **Subcommand per step.** `bin/setup` runs the whole walk; `bin/setup
  install-docker` runs just one step. The ordered list lives in a `WALK_STEPS`
  array; each step is an `if should_run <step>; then … fi` block in the same
  order.
- **Idempotent + re-runnable.** Every step checks current state and `skip`s
  what's already done. Safe on a fresh machine or a half-configured one.
- **`--check` dry-run.** Validates and prints what *would* change without
  mutating anything; exits non-zero if drift is found. (`do_or_check` wraps
  every side-effecting command.)
- **`doctor` subcommand.** Read-only health report (pass/warn/fail), never
  mutates.
- **Tiny, consistent helper vocabulary:** `step`, `ok`, `skip`, `warn`, `err`,
  `hint`, `runlog`, `die`, `have` (command exists?), `ensure_pkg`,
  `do_or_check`, `do_always`, `did`.
- **Per-step log capture** under `tmp/setup-logs/` + a failure banner that
  names the failing step and the exact command to re-run.
- **Docker lifecycle is delegated** to a separate script
  ([`bin/pwx-docker`](/opt/apps/dev/code/bin/pwx-docker)) with subcommands
  `setup / up / down / restart / logs / ps / clean`. On macOS `setup` installs
  and starts **colima** (not Docker Desktop); on Linux it verifies the native
  daemon. `bin/setup`'s `install-docker` and `start-stack` steps just call into
  it.

I will mirror this structure, scaled down — itsanproblem has no
MySQL/Meilisearch/MinIO/Terraform/Ansible, so the walk is much shorter.

---

## 2. Current state of itsanproblem (what's broken today)

The repo already has Docker files, but they don't work as a set:

| File | Problem |
|------|---------|
| [docker-compose.yml](docker-compose.yml) | Line 12 is a stray `cd` — invalid YAML/garbage. Wires **Postgres + Redis**, but… |
| [backend/config/database.yml](backend/config/database.yml) | …is **SQLite-only for every env**, and there is **no `pg` gem** in the Gemfile. The compose `DATABASE_URL: postgres://…` cannot connect. |
| backend cache/queue/cable | Use `solid_cache` / `solid_queue` / `solid_cable` (SQLite-backed), **not Redis** — so the compose `redis` service is currently unused by the app. |
| [backend/Dockerfile](backend/Dockerfile) | A mess: a commented-out production multi-stage, a live `FROM base` that references the now-commented `base` stage (won't build), then a second duplicate `FROM ruby:4.0.3` dev stage appended at the bottom. |
| [frontend/Dockerfile](frontend/Dockerfile) | Functional but minimal — unpinned `node:20` tag, no layer/dep separation beyond the basics. |
| repo root | No root-level `bin/` to orchestrate the monorepo (backend has only the stock Rails 8 bin scripts). |

**Decision taken (you chose this):** the Docker dev stack will use **PostgreSQL**
to match CLAUDE.md's stated intent, while **local (non-Docker) dev stays on
SQLite**. That requires small backend changes (Section 5).

---

## 3. Proposed file layout

```
itsanproblem/
├── bin/
│   ├── setup            # NEW — root orchestrator (bash, subcommand walk)
│   ├── docker           # NEW — colima(itsaprom) + compose lifecycle delegate
│   └── _sops_env.sh     # NEW — SOPS→env loader (ported from code)
├── .sops.yaml           # NEW — SOPS creation rules (dev + prod, age recipient)
├── secrets/
│   ├── development.yml  # NEW — SOPS-encrypted
│   └── production.yml   # NEW — SOPS-encrypted
├── mise.toml            # NEW — pins ruby 4.0.3 + node
├── docker-compose.yml   # REWRITE — postgres + valkey + backend + frontend
├── .env.example         # NEW — documents the env the stack reads
├── backend/
│   ├── Dockerfile       # REWRITE — clean dev image (Ruby 4.0.3, pg deps)
│   ├── Gemfile          # EDIT — add pg
│   └── config/database.yml   # EDIT — env-driven (sqlite local / pg in docker)
└── frontend/
    └── Dockerfile       # REWRITE — pinned node, cleaner layers
```

I'm putting `bin/setup` at the **repo root** (not in `backend/`) because this is
a monorepo — it has to bootstrap both halves. The backend keeps its existing
`backend/bin/setup` (the stock Rails one); the root script calls down into the
backend and frontend.

---

## 4. `bin/setup` design (the walk)

A single bash script following the `code` idioms. Proposed `WALK_STEPS`:

```
detect-os            # macOS or Ubuntu/Debian; anything else aborts cleanly
ensure-package-manager  # brew on macOS / apt-get on Ubuntu (sanity check)
install-mise         # toolchain manager; pins Ruby 4.0.3 + Node via mise
install-ruby         # mise install (reads backend/.ruby-version)
install-node         # mise install Node for the frontend
install-docker       # delegate -> bin/docker setup (colima on macOS)
backend-bundle       # cd backend && bundle install (skip if `bundle check` ok)
frontend-npm         # cd frontend && npm install (skip if node_modules fresh)
start-stack          # delegate -> bin/docker up (postgres, backend, frontend)
db-setup             # rails db:prepare inside the backend container
doctor               # sibling subcommand (not in the default walk)
```

Flags (ported from `code`): `--check` (dry-run), `--skip-stack`
(implies `--skip-db`), `--skip-db`, `-h/--help`.

Examples it will support:

```
bin/setup                 # full bootstrap
bin/setup --check         # report what would change, mutate nothing
bin/setup install-docker  # just install/start the container runtime
bin/setup doctor          # read-only health report
bin/setup --skip-stack    # toolchain only, no containers
```

Notes:

- `mise` is optional but recommended — it's how `code` pins Ruby/Node. If you'd
  rather not adopt `mise` here, the `install-mise/ruby/node` steps can instead
  just **verify** that the right Ruby/Node are on PATH and point at install
  instructions. (Open question Q2.)
- Same helper vocabulary and `--check`/`doctor` behavior as `code`, so the two
  repos feel the same to operate.

---

## 5. Backend changes required for Postgres-in-Docker

To let **local dev stay SQLite** while **Docker uses Postgres**, the cleanest,
lowest-risk approach is env-driven:

1. **Add the `pg` gem** to `backend/Gemfile` (alongside `sqlite3`, which local
   dev keeps using).
2. **Make `database.yml` adapter env-driven.** Rails already honors
   `DATABASE_URL` when set — locally it's unset → falls back to the SQLite
   config; in Docker compose sets `DATABASE_URL=postgres://…` → Postgres. The
   `development`/`test` blocks stay SQLite by default; no behavior change for
   anyone running outside Docker.
3. **`solid_cache` / `solid_queue` / `solid_cable`** are configured as SQLite
   sidecar databases. In the Postgres dev container we either (a) point them at
   the same Postgres via separate URLs, or (b) leave them as local SQLite files
   inside the container. I recommend **(b)** for the dev stack — least churn,
   and these are dev conveniences, not the thing we're testing. (Open question
   Q3.)
4. **Redis**: the app doesn't need it for the core path (queue/cache/cable are
   solid_*). I'll **drop the `redis` service** from compose unless you want
   Sidekiq exercised in Docker. (Open question Q4.)

Local SQLite dev (`bundle exec rails server` straight off the laptop) is
**unaffected** by all of the above.

---

## 6. Rewritten Docker artifacts (sketches)

These are illustrative shapes, not final — we'll finalize during implementation.

**`docker-compose.yml`** (SQLite stray-`cd` gone; Postgres real):

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: itsanproblem
      POSTGRES_PASSWORD: itsanproblem
      POSTGRES_DB: itsanproblem_development
    volumes: [db_data:/var/lib/postgresql/data]
    ports: ["5432:5432"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U itsanproblem"]
      interval: 5s
      retries: 10

  backend:
    build: ./backend
    command: ./bin/docker-entrypoint ./bin/rails server -b 0.0.0.0 -p 3000
    environment:
      DATABASE_URL: postgres://itsanproblem:itsanproblem@db:5432/itsanproblem_development
      RAILS_ENV: development
    volumes: ["./backend:/rails"]
    ports: ["3000:3000"]
    depends_on:
      db: { condition: service_healthy }

  frontend:
    build: ./frontend
    command: npm run dev -- --host 0.0.0.0 --port 5173
    volumes: ["./frontend:/app", "/app/node_modules"]
    ports: ["5173:5173"]
    depends_on: [backend]

volumes:
  db_data:
```

**`backend/Dockerfile`** — a clean single dev image (Ruby 4.0.3, build deps for
`pg`, bundle install layered before app copy). The existing
[backend/bin/docker-entrypoint](backend/bin/docker-entrypoint) already runs
`rails db:prepare`, so I'll keep using it.

**`frontend/Dockerfile`** — pin to `node:20-bookworm-slim` (or the version we
settle on), copy `package*.json` → `npm ci` → copy source.

**`bin/docker`** (the delegate) — subcommands:
`setup` (colima on macOS / verify daemon on Linux), `up`, `down`, `logs [svc]`,
`ps`, `build`, `clean`. Thin wrappers over `docker compose` so `bin/setup` and
you both drive the stack the same way.

---

## 7. Decisions — FINAL (locked during review)

- **Q1 — Scope of `bin/setup`:** ✅ **Full `code`-style script** — subcommand
  walk, `--check` dry-run, `doctor`, per-step log capture + failure banner.
- **Q2 — `mise`:** ✅ **Adopt `mise`** to pin Ruby 4.0.3 + Node (via `mise.toml`).
- **Q3 — `solid_*`:** ✅ **Same Postgres.** In *development* the app uses memory
  cache + async cable (solid_* are inactive), so the dev stack only needs the
  primary Postgres DB. The *production* config will point `solid_cache` /
  `solid_queue` / `solid_cable` at the **same Postgres database** (instead of
  the current separate SQLite files).
- **Q4 — Redis:** ✅ **Drop vanilla Redis; add Valkey** (`valkey/valkey:8-alpine`)
  — this is exactly what `code` runs. It's exposed to the app as `REDIS_URL`
  for the present `sidekiq`/`redis` gems even though the core path uses
  `solid_*`. Mirrors `code`'s service set without pulling in MySQL/Meilisearch/
  MinIO (itsanproblem uses ActiveStorage `:local` disk, so no MinIO needed).
- **Q5 — Postgres:** ✅ **`postgres:latest`**, dev creds `itsanproblem` /
  `itsanproblem`, named volume `db_data`.
- **Colima:** ✅ `bin/docker setup` creates/starts a dedicated colima profile
  named **`itsaprom`** (mirrors `code`'s `pwx` profile), Apple-Silicon `vz`.
- **Secrets (SOPS + age):** ✅ Adopt SOPS like `code`. Use the existing age key
  at `~/.config/sops/age/keys.txt` (recipient
  `age10e4t2qf24xrscvj72293s0f3fd5uqkd6f6wlv7ky86ds37d2n42q32vwlh`). **Two envs
  only:** `secrets/development.yml` and `secrets/production.yml`, encrypted via
  a new root `.sops.yaml`. A `bin/_sops_env.sh` loader (ported from `code`)
  decrypts and exports leaves as env vars, sourced by `bin/setup` / `bin/docker`.

### Service set (final)

| Service  | Image                    | Why |
|----------|--------------------------|-----|
| db       | `postgres:latest`        | App database (Q5). |
| valkey   | `valkey/valkey:8-alpine` | Redis-compatible, mirrors `code` (Q4); `REDIS_URL`. |
| backend  | `./backend` (Ruby 4.0.3) | Rails API on :3000. |
| frontend | `./frontend` (Node)      | Vite SPA on :5173. |

---

## 8. Rollout (the order we'll implement, once approved)

1. Backend: add `pg`, make `database.yml` env-driven, point prod `solid_*` at
   Postgres, `bundle lock`.
2. Rewrite `backend/Dockerfile` and `frontend/Dockerfile`; add `mise.toml`.
3. Rewrite `docker-compose.yml` (postgres + valkey + backend + frontend) + `.env.example`.
4. SOPS: add `.sops.yaml`, `bin/_sops_env.sh`, encrypted `secrets/development.yml`
   - `secrets/production.yml` (age key already present).
5. Add `bin/docker` (colima `itsaprom` + compose delegate), make executable.
6. Add `bin/setup` (the walk + `--check`/`doctor`), make executable.
7. Verify: `bin/setup --check`, then `bin/setup`, then hit
   `localhost:5173` (frontend) and `localhost:3000/api/v1` (backend).
8. Update `README.md` / CLAUDE.md to document the new entry points.

Per repo convention I'll stage files explicitly (no `git add -A`) and only
commit when you ask.

```
