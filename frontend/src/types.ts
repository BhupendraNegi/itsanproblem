export type User = {
  id: number
  name: string
  email: string
}

export type Comment = {
  id: number
  body: string
  author: string
  created_at: string
}

export type Post = {
  id: number
  title: string
  body: string
  author: string
  created_at: string
  comments: Comment[]
}

export type AuthResponse = {
  user: User
  token: string
}
