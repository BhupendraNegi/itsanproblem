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
- Ruby 3.4+
- Node.js 18+
- SQLite (for development)

### Local Development

#### Backend
```bash
cd backendnpm
bundle install
bundle exec rails db:migrate
bundle exec rails server
```
The backend will run on http://localhost:3000

#### Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on http://localhost:5173

### Docker Development
```bash
docker-compose up --build
```
- Backend: http://localhost:3000
- Frontend: http://localhost:5173

Note: The Docker setup uses PostgreSQL, while local development uses SQLite. Adjust database configuration as needed.

## API Endpoints
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/posts` - List all posts
- `POST /api/v1/posts` - Create anonymous post (requires auth)
- `POST /api/v1/posts/:id/comments` - Add comment to post (requires auth)

## TODO:
🔒 environment & secrets

- use dotenv both in rails + react.

env vars:

- DATABASE_URL

- REDIS_URL

- SECRET_KEY_BASE

- STORAGE_BUCKET/S3 creds
