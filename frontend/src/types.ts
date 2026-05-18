export type User = {
  id: number
  name: string
  email: string
}

export type Comment = {
  id: number
  body: string
  author: string
  author_id: number
  created_at: string
}

export type Post = {
  id: number
  title: string
  body: string
  author: string
  anon_handle?: string
  helpful_count?: number
  created_at: string
  comments: Comment[]
}

export type AuthResponse = {
  user: User
  token: string
}

export type ProfileComment = {
  id: number
  body: string
  created_at: string
  post_id: number
  post_title: string
}

export type UserProfile = {
  id: number
  name: string
  joined_at: string
  helpful_points: number
  comment_count: number
  recent_comments: ProfileComment[]
}
