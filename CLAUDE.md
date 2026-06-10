# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

itsanproblem is an anonymous problem-sharing platform. Users post problems that always appear as "Anonymous", while comments are attributed to the commenter's name. It is a split monorepo: a Rails 8 API in [backend/](backend/) and a React + TypeScript SPA in [frontend/](frontend/). The two communicate over a JSON API under `/api/v1`.

## Commands

### Backend (run from `backend/`)
- Install: `bundle install`
- DB setup: `bundle exec rails db:migrate` (development uses SQLite)
- Run server: `bundle exec rails server` (port 3000)
- All tests: `bundle exec rspec`
- Single test file: `bundle exec rspec spec/requests/api/v1/posts_spec.rb`
- Single example: `bundle exec rspec spec/path/to_spec.rb:42`
- Lint: `bundle exec rubocop` (rubocop-rails-omakase style)
- Security scan: `bundle exec brakeman`

### Frontend (run from `frontend/`)
- Install: `npm install`
- Dev server: `npm run dev` (port 5173, proxies `/api` → `http://127.0.0.1:3000`)
- Build: `npm run build` (`tsc -b && vite build`)
- All tests: `npm test` (Vitest, single run); watch with `npm run test:watch`
- Single test file: `npx vitest run src/__tests__/components/PostCard.test.tsx`
- Coverage: `npm run test:coverage`
- Lint: `npm run lint` (ESLint)

### Full stack via Docker
- `docker-compose up --build` — backend on 3000, frontend on 5173. **Docker uses PostgreSQL while local development uses SQLite**, so database config differs between the two environments.

## Architecture

### Backend (Rails 8 API-only)
- All endpoints live under the `api/v1` namespace ([config/routes.rb](backend/config/routes.rb)); controllers are in [app/controllers/api/v1/](backend/app/controllers/api/v1/) and inherit from `ActionController::API`.
- **Authentication is hand-rolled JWT, not Devise's session/JWT flow.** [ApplicationController](backend/app/controllers/application_controller.rb) implements `authenticate_user!`, `encode_token`, and `decode_token` directly. Tokens are HS256, expire in 24h, and are signed with `ENV["JWT_SECRET_KEY"]` falling back to `Rails.application.secret_key_base`. Clients send `Authorization: Bearer <token>`. Devise is still used by the `User` model for password hashing/validation (`valid_password?`, `find_for_database_authentication`), and `devise-jwt`/`rack-attack` gems are present but the request auth path does not route through them.
- **JSON serialization is done via model `as_json` overrides**, not Blueprinter (the gem is in the Gemfile but unused). [Post#as_json](backend/app/models/post.rb) forces `"author" => "Anonymous"` and embeds ordered comments — this is the core anonymity guarantee. [Comment#as_json](backend/app/models/comment.rb) exposes the real `author` name and `author_id`. When changing post output, preserve the Anonymous override.
- Data model: `User` has many `posts` and `comments` and one `user_stat`; `Post` belongs to a user (hidden from output) and has many comments. `UserStat` tracks `helpful_points` and `comment_count`, lazily created via `UserStat.for_user`.
- CORS ([config/initializers/cors.rb](backend/config/initializers/cors.rb)) is wide open (`origins "*"`) — intended for development.
- Solid Queue / Solid Cache / Solid Cable are configured; Sidekiq + Redis and Sentry gems are also present.

### Frontend (React 19 + Vite + TypeScript)
- **Server state vs. client state are deliberately separated.** TanStack React Query owns all API data; all queries and mutations are centralized in [src/hooks/useMutations.ts](frontend/src/hooks/useMutations.ts) (`usePosts`, `useUserProfile`, `useAuthMutation`, `usePostMutation`, `useCommentMutation`). Mutations invalidate the `['posts']` query key to refresh. Auth state (current user + token) lives in a Zustand store ([src/store.ts](frontend/src/store.ts)) and is persisted to `localStorage` (`authUser`, `authToken`).
- All HTTP goes through [src/api.ts](frontend/src/api.ts), a single axios instance with `baseURL: '/api/v1'` and a request interceptor that injects the bearer token from `localStorage`. Add new endpoints here.
- Routing is React Router; [src/App.tsx](frontend/src/App.tsx) holds the main feed and most local form state (`useState`), `ProfilePage` is the other route.
- **Tests use MSW** ([src/mocks/](frontend/src/mocks/)) to mock the API at the network layer; `onUnhandledRequest: 'error'` ([src/test/setup.ts](frontend/src/test/setup.ts)) means any un-mocked request fails the test. Use [src/test/renderWithProviders.tsx](frontend/src/test/renderWithProviders.tsx) to wrap components with the Query/Router providers.
- Styling is Tailwind CSS v4. See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) and [frontend/README_ARCHITECTURE.md](frontend/README_ARCHITECTURE.md).

## Conventions & gotchas
- **Ruby version mismatch:** the repo targets Ruby **4.0.3** ([.ruby-version](backend/.ruby-version), Gemfile), but RuboCop's `TargetRubyVersion` is pinned to **3.3** in [.rubocop.yml](backend/.rubocop.yml) because the parser does not yet support 4.0. The root README's "Ruby 3.4+" note is stale.
- Error responses use a consistent shape: `{ error: "..." }` for single messages, `{ errors: [...] }` (from `model.errors.full_messages`) for validation failures, with `422 :unprocessable_content` for invalid input and `401 :unauthorized` for auth failures.
- API param wrapping: posts are sent as `{ post: {...} }`, comments as `{ comment: {...} }`, auth as `{ user: {...} }`. The frontend camelCase `passwordConfirmation` is mapped to `password_confirmation` in [src/api.ts](frontend/src/api.ts).
