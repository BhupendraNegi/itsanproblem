export type User = {
  id: number
  name: string
  email: string
}

export type Comment = {
  id: number
  body: string
  author: string
  // null when the comment is by the OP, who stays anonymous in their thread
  author_id: number | null
  helpful_count?: number
  viewer_marked?: boolean
  created_at: string
}

export type Post = {
  id: number
  title: string
  body: string
  author: string
  anon_handle?: string
  helpful_count?: number
  viewer_marked?: boolean
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

export type Notification = {
  id: number
  event: 'reply' | 'helpful_mark'
  post_id: number
  post_title: string
  read: boolean
  created_at: string
}

export type NotificationsResponse = {
  notifications: Notification[]
  unread_count: number
}

export type UserProfile = {
  id: number
  name: string
  joined_at: string
  helpful_points: number
  comment_count: number
  recent_comments: ProfileComment[]
}
