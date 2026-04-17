# It's A Problem - Backend API

A Rails API server that powers the anonymous problem-sharing platform. Built with Rails 8, Devise, and JWT authentication.

## 🏗️ Architecture Overview

### System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Frontend (React)                       │
│                                                            │
│  Makes HTTP Requests (JSON)                               │
└─────────────────────────┬──────────────────────────────────┘
                          │
                   HTTP/REST API
                          │
┌─────────────────────────▼──────────────────────────────────┐
│               Rails Backend (Port 3000)                    │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              CORS Middleware                          │ │
│  │  (Allows cross-origin requests from frontend)        │ │
│  └──────────────────────┬───────────────────────────────┘ │
│                         │                                  │
│  ┌──────────────────────▼───────────────────────────────┐ │
│  │         Authentication Layer (JWT)                   │ │
│  │  (Devise with token authentication)                  │ │
│  └──────────────────────┬───────────────────────────────┘ │
│                         │                                  │
│  ┌──────────────────────▼───────────────────────────────┐ │
│  │         API Routes & Controllers                     │ │
│  │  ┌──────────────────────────────────────────────┐   │ │
│  │  │ Users Controller                             │   │ │
│  │  │  - register (POST /api/users)                │   │ │
│  │  │  - login (POST /api/users/login)             │   │ │
│  │  └──────────────────────────────────────────────┘   │ │
│  │  ┌──────────────────────────────────────────────┐   │ │
│  │  │ Posts Controller                             │   │ │
│  │  │  - index (GET /api/posts)                    │   │ │
│  │  │  - create (POST /api/posts)                  │   │ │
│  │  └──────────────────────────────────────────────┘   │ │
│  │  ┌──────────────────────────────────────────────┐   │ │
│  │  │ Comments Controller                          │   │ │
│  │  │  - create (POST /api/posts/:id/comments)    │   │ │
│  │  └──────────────────────────────────────────────┘   │ │
│  └──────────────────────┬───────────────────────────────┘ │
│                         │                                  │
│  ┌──────────────────────▼───────────────────────────────┐ │
│  │              Models & Business Logic                │ │
│  │  ┌──────────────┐  ┌──────────────┐                 │ │
│  │  │ User Model   │  │ Post Model   │                 │ │
│  │  │  - Auth      │  │  - Relations │                 │ │
│  │  │  - Validation│  │  - Scopes    │                 │ │
│  │  └──────────────┘  └──────────────┘                 │ │
│  │  ┌──────────────┐                                   │ │
│  │  │ Comment Model│                                   │ │
│  │  │  - Relations │                                   │ │
│  │  │  - Validation│                                   │ │
│  │  └──────────────┘                                   │ │
│  └──────────────────────┬───────────────────────────────┘ │
│                         │                                  │
│  ┌──────────────────────▼───────────────────────────────┐ │
│  │        Database Layer (PostgreSQL)                   │ │
│  │                                                       │ │
│  │  ┌──────────────┬─────────┬──────────────┐           │ │
│  │  │   Users      │  Posts  │  Comments    │           │ │
│  │  │   Table      │  Table  │   Table      │           │ │
│  │  └──────────────┴─────────┴──────────────┘           │ │
│  └───────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## 📂 File Structure

```
app/
├── controllers/
│   ├── application_controller.rb    # Base controller with auth helpers
│   └── concerns/                    # Shared controller functionality
│
├── models/
│   ├── application_record.rb        # Base model
│   ├── user.rb                      # User model (Devise)
│   ├── post.rb                      # Post model
│   ├── comment.rb                   # Comment model
│   └── concerns/                    # Shared model functionality
│
├── jobs/
│   └── application_job.rb           # Base background job
│
├── mailers/
│   └── application_mailer.rb        # Base mailer class
│
└── views/                           # Email templates

config/
├── routes.rb                        # API routes definition
├── application.rb                   # Rails configuration
├── boot.rb                          # Rails boot configuration
├── cable.yml                        # ActionCable config
├── cache.yml                        # Caching configuration
├── credentials.yml.enc              # Encrypted credentials (secrets)
├── database.yml                     # Database configuration
│
├── environments/
│   ├── development.rb               # Development settings
│   ├── production.rb                # Production settings
│   └── test.rb                      # Test settings
│
├── initializers/
│   ├── cors.rb                      # CORS configuration
│   ├── devise.rb                    # Devise JWT setup
│   ├── filter_parameter_logging.rb # Sensitive params filtering
│   └── inflections.rb               # Word inflections
│
└── locales/
    ├── devise.en.yml               # Devise translations
    └── en.yml                       # General translations

db/
├── migrate/                         # Database migrations
│   └── 20250906053554_devise_create_users.rb
├── cache_schema.rb                  # Cache schema
├── cable_schema.rb                  # Cable schema
├── queue_schema.rb                  # Queue schema
└── seeds.rb                         # Database seeds

spec/
├── rails_helper.rb                  # RSpec configuration
├── spec_helper.rb                   # RSpec shared config
└── models/
    └── user_spec.rb                 # User model tests

bin/
├── rails                            # Rails command
├── bundle                           # Bundler command
├── dev                              # Development runner
├── docker-entrypoint                # Docker entry point
└── setup                            # Setup script
```

## 🔌 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| `POST` | `/api/users` | Register new user | ❌ No |
| `POST` | `/api/users/login` | Login user (get token) | ❌ No |
| `DELETE` | `/api/users/logout` | Logout user | ✅ Yes |

### Post Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| `GET` | `/api/posts` | Get all posts with comments | ❌ No |
| `POST` | `/api/posts` | Create new post | ✅ Yes |
| `GET` | `/api/posts/:id` | Get single post | ❌ No |

### Comment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| `POST` | `/api/posts/:id/comments` | Add comment to post | ✅ Yes |
| `DELETE` | `/api/comments/:id` | Delete comment | ✅ Yes |

## 📊 Database Schema

```
Users Table
├── id (PRIMARY KEY)
├── name (STRING)
├── email (STRING, UNIQUE)
├── encrypted_password (STRING)
├── authentication_token (STRING)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

Posts Table
├── id (PRIMARY KEY)
├── user_id (FOREIGN KEY → Users)
├── title (STRING)
├── body (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

Comments Table
├── id (PRIMARY KEY)
├── post_id (FOREIGN KEY → Posts)
├── user_id (FOREIGN KEY → Users)
├── body (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### Model Relationships

```
User (1 user)
├── has_many :posts
└── has_many :comments

Post (1 post)
├── belongs_to :user
└── has_many :comments

Comment (1 comment)
├── belongs_to :user
└── belongs_to :post
```

## 🔐 Authentication Flow

```
Frontend (React)
    │
    ▼
[1] Send credentials (email, password)
    │
    ▼
Backend (POST /api/users or /api/users/login)
    │
    ▼
[2] User validation & verification
    │
    ▼
[3] Generate JWT token
    │
    ▼
[4] Send token + user data to frontend
    │
    ▼
Frontend (Store token in state)
    │
    ▼
[5] Include token in Authorization header for future requests
    │
    ▼
Backend (Verify token in requests)
    │
    ▼
[6] Grant access if token valid, deny if invalid
```

## 🛠️ Tech Stack

- **Ruby on Rails 8** - Web framework
- **Devise** - Authentication
- **JWT (JSON Web Tokens)** - Token-based auth
- **PostgreSQL** - Database
- **Puma** - Web server
- **Rack CORS** - Cross-origin request handling

## 🚀 Running the App

```bash
# Install dependencies
bundle install

# Setup database
bundle exec rails db:migrate

# Seed sample data (optional)
bundle exec rails db:seed

# Start development server
bundle exec rails server

# Run tests
bundle exec rspec

# Lint code
bundle exec rubocop
```

## ⚙️ Configuration

### CORS Setup
Configured to accept requests from frontend (see `config/initializers/cors.rb`)

### Devise Configuration
Configured for API mode with JWT authentication (see `config/initializers/devise.rb`)

### Database
- Type: PostgreSQL
- Configuration: `config/database.yml`

## 📝 Key Endpoints Examples

### Register User
```bash
POST /api/users
Content-Type: application/json

{
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secure_password",
    "password_confirmation": "secure_password"
  }
}
```

### Login User
```bash
POST /api/users/login
Content-Type: application/json

{
  "user": {
    "email": "john@example.com",
    "password": "secure_password"
  }
}
```

### Create Post (with auth token)
```bash
POST /api/posts
Content-Type: application/json
Authorization: Bearer <token>

{
  "post": {
    "title": "My Problem Title",
    "body": "Detailed problem description..."
  }
}
```

### Add Comment (with auth token)
```bash
POST /api/posts/1/comments
Content-Type: application/json
Authorization: Bearer <token>

{
  "comment": {
    "body": "My helpful comment or feedback..."
  }
}
```

## 🔄 API Response Format

### Success Response
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "authentication_token": "eyJhbGc..."
    }
  }
}
```

### Error Response
```json
{
  "status": "error",
  "errors": ["Email has already been taken"]
}
```
