export type Role = 'member' | 'moderator' | 'admin'

export type Tag = {
  id: number
  name: string
  slug: string
}

export type TagWithCount = Tag & { post_count: number }

export type User = {
  id: number
  name: string
  // optional: sessions stored before usernames existed lack it until re-login
  username?: string
  email: string
  role?: Role
}

export type AdminStats = {
  users: number
  posts: number
  comments: number
  flags: number
  hidden_posts: number
  hidden_comments: number
}

export type AdminFlaggedPost = {
  id: number
  title: string
  body: string
  hidden: boolean
  flag_count: number
  reasons: Record<string, number>
  created_at: string
}

export type AdminFlaggedComment = {
  id: number
  body: string
  post_id: number
  post_title: string
  hidden: boolean
  flag_count: number
  reasons: Record<string, number>
  created_at: string
}

export type AdminFlagsResponse = {
  posts: AdminFlaggedPost[]
  comments: AdminFlaggedComment[]
}

export type AdminUser = {
  id: number
  name: string
  username: string
  email: string
  role: Role
  joined_at: string
  post_count: number
  comment_count: number
}

export type Comment = {
  id: number
  body: string
  author: string
  // null when the comment is by the OP, who stays anonymous in their thread
  author_id: number | null
  author_username?: string | null
  // true when this reply is by the post's (anonymous) author
  op?: boolean
  helpful_count?: number
  viewer_marked?: boolean
  created_at: string
}

export type Post = {
  id: number
  title: string
  body: string
  author: string
  author_id?: number | null
  author_username?: string | null
  anonymous?: boolean
  tag?: Tag | null
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

export type ProfilePost = {
  id: number
  title: string
  anonymous?: boolean
  created_at: string
  helpful_count: number
  comment_count: number
  hidden: boolean
}

export type UserProfile = {
  id: number
  name: string
  username: string
  bio: string | null
  joined_at: string
  helpful_points: number
  comment_count: number
  recent_comments: ProfileComment[]
  // only present when viewing your own profile
  posts?: ProfilePost[]
  email_digest_enabled?: boolean
}
