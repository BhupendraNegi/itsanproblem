# It's A Problem - Frontend Architecture

A modern React + TypeScript application for sharing anonymous problems and getting community feedback.

## 🏗️ Project Architecture

### Overall Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
├─────────────────────────────────────────────────────────────┤
│                      React Frontend                           │
│  ┌─────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │   Navbar    │  │  App.tsx   │  │   Zustand Store      │  │
│  │  (Header)   │  │  (Router)  │  │   (Auth State)       │  │
│  └─────────────┘  └────────────┘  └──────────────────────┘  │
│         ▲              │                      ▲               │
│         └──────────────┴──────────────────────┘               │
│                        │                                      │
│         ┌──────────────▼──────────────┐                       │
│         │    Component Tree           │                       │
│         │  ┌──────────────────────┐   │                       │
│         │  │   AuthPanel          │   │                       │
│         │  │  (Login/Register)    │   │                       │
│         │  └──────────────────────┘   │                       │
│         │  ┌──────────────────────┐   │                       │
│         │  │  PostForm            │   │                       │
│         │  │ (Create Post)        │   │                       │
│         │  └──────────────────────┘   │                       │
│         │  ┌──────────────────────┐   │                       │
│         │  │  PostCard            │   │                       │
│         │  │ (Display + Comments) │   │                       │
│         │  └──────────────────────┘   │                       │
│         └──────────────▬──────────────┘                       │
│                        │                                      │
│         ┌──────────────▼──────────────┐                       │
│         │   TanStack Query             │                       │
│         │  (Data Fetching & Caching)  │                       │
│         └──────────────┬──────────────┘                       │
│                        │                                      │
│         ┌──────────────▼──────────────┐                       │
│         │   useMutations (Hooks)      │                       │
│         │  ┌──────────────────────┐   │                       │
│         │  │ useAuthMutation      │   │                       │
│         │  │ usePostMutation      │   │                       │
│         │  │ useCommentMutation   │   │                       │
│         │  │ usePosts             │   │                       │
│         │  └──────────────────────┘   │                       │
│         └──────────────┬──────────────┘                       │
│                        │                                      │
│         ┌──────────────▼──────────────┐                       │
│         │   API Layer (Axios)         │                       │
│         └──────────────┬──────────────┘                       │
└────────────────────────┼──────────────────────────────────────┘
                         │
                    HTTP Requests
                         │
            ┌────────────▼────────────┐
            │   Rails Backend API     │
            │   (Port 3000)           │
            └────────────────────────┘
```

## 📂 File Structure

```
src/
├── App.tsx                      # Main app component with routing logic
├── App.css                      # Global styles
├── main.tsx                     # Entry point
├── vite-env.d.ts               # Vite type definitions
├── api.ts                       # API client (Axios instance)
├── store.ts                     # Zustand auth store
├── types.ts                     # TypeScript type definitions
│
├── components/                  # Reusable React components
│   ├── AuthPanel.tsx           # Login/Register form component
│   ├── Header.tsx              # Navigation bar component
│   ├── PostForm.tsx            # Create post form component
│   └── PostCard.tsx            # Post display + comments component
│
├── hooks/                       # Custom React hooks
│   └── useMutations.ts         # API mutation hooks
│       ├── useAuthMutation     # Login/Register mutation
│       ├── usePostMutation     # Create post mutation
│       ├── useCommentMutation  # Create comment mutation
│       └── usePosts            # Fetch posts query
│
└── assets/                      # Static assets
    └── (add images, fonts here)
```

## 🔄 Component Relationships

```
App (Main Component)
│
├── If NOT logged in:
│   ├── Navbar (minimal, just title)
│   └── AuthPanel
│       ├── Login Form
│       └── Register Form
│
└── If logged in:
    ├── Navbar (with user info & logout)
    ├── PostForm (create new post)
    └── Posts Grid
        └── PostCard (repeats for each post)
            ├── Post Header (title, author, date)
            ├── Post Body (content)
            └── Comments Section
                ├── Comment List
                └── Comment Form
```

## 🔌 API Integration

### Key API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/users/register` | Register new user |
| `POST` | `/api/users/login` | User login |
| `GET` | `/api/posts` | Fetch all posts |
| `POST` | `/api/posts` | Create new post |
| `POST` | `/api/posts/:id/comments` | Add comment to post |

## 🎨 Data Flow

```
User Action
    │
    ▼
Component State Update
    │
    ▼
useMutation Hook (or useQuery)
    │
    ▼
API Call (via Axios)
    │
    ▼
Backend Processing
    │
    ▼
Response + Cache Update (TanStack Query)
    │
    ▼
Component Re-render
    │
    ▼
UI Updated
```

## 🛠️ Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **TanStack Query** - Server state management
- **Zustand** - Client state management (auth)
- **Axios** - HTTP client
- **CSS** - Styling

## 🚀 Running the App

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 📝 Key Features

✅ User authentication (register, login, logout)
✅ Create anonymous posts
✅ Add named comments on posts
✅ Real-time post and comment display
✅ Responsive design
✅ Type-safe TypeScript codebase
✅ Efficient data fetching with TanStack Query

## 🔐 State Management

### Zustand Store (Auth)
Manages:
- Current logged-in user
- Auth token
- Login/Logout actions

### TanStack Query (Server State)
Manages:
- Posts cache
- Automatic refetching
- Mutation handling

## 📋 Component Details

### AuthPanel.tsx
- Displays login/register form
- Handles form input and submission
- Shows validation errors and loading states

### Header.tsx
- Shows app title and subtitle
- Displays logged-in user info
- Provides logout button

### PostForm.tsx
- Form to create new anonymous posts
- Validates title and body
- Shows loading state while posting

### PostCard.tsx
- Displays individual post with title, body, and metadata
- Lists all comments for the post
- Provides comment form for adding new comments
- Shows proper formatting and timestamps

## 🔄 Authentication Flow

```
[1] User enters email/password
         ↓
[2] Submit registration or login form
         ↓
[3] API call to backend (/api/users or /api/users/login)
         ↓
[4] Receive token + user data
         ↓
[5] Store in Zustand (useAuth store)
         ↓
[6] Navigate to main app
         ↓
[7] Token included in all future requests
```

## 🎯 Component Communication

```
Store (useAuth)
    ↑         ↓
    ↑         ↓
  App.tsx ← manages → AppContent
    ↓     (component tree)
    ├── Header (receives user, onLogout)
    ├── AuthPanel (receives auth callbacks)
    ├── PostForm (uses mutations)
    └── PostCard (reads/writes posts)
```
