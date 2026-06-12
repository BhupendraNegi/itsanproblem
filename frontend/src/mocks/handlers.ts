import { http, HttpResponse } from 'msw'

export const mockUser = { id: 1, name: 'Alice', username: 'alice', email: 'alice@example.com' }
export const mockToken = 'mock-jwt-token'

export const mockPost = {
  id: 1,
  title: 'My problem',
  body: 'It is really bad and I need help.',
  author: 'Anonymous',
  author_id: null,
  author_username: null,
  anonymous: true,
  helpful_count: 0,
  viewer_marked: false,
  created_at: new Date().toISOString(),
  comments: [],
}

export const mockComment = {
  id: 1,
  body: 'Have you tried turning it off?',
  author: 'Bob',
  author_id: 2,
  author_username: 'bob',
  op: false,
  created_at: new Date().toISOString(),
}

export const mockProfile = {
  id: 1,
  name: 'Alice',
  username: 'alice',
  bio: 'Just here to help.',
  joined_at: new Date('2025-01-01').toISOString(),
  helpful_points: 5,
  comment_count: 3,
  email_digest_enabled: true,
  posts: [
    {
      id: 1,
      title: 'My secret problem',
      anonymous: true,
      created_at: new Date().toISOString(),
      helpful_count: 2,
      comment_count: 1,
      hidden: false,
    },
  ],
  recent_comments: [
    {
      id: 1,
      body: 'This helped me too.',
      created_at: new Date().toISOString(),
      post_id: 1,
      post_title: 'My problem',
    },
  ],
}

export const mockNotifications = {
  notifications: [
    {
      id: 1,
      event: 'reply',
      post_id: 1,
      post_title: 'My problem',
      read: false,
      created_at: new Date().toISOString(),
    },
  ],
  unread_count: 1,
}

export const mockAdminStats = {
  users: 4,
  posts: 5,
  comments: 7,
  flags: 2,
  hidden_posts: 1,
  hidden_comments: 0,
}

export const mockAdminFlags = {
  posts: [
    {
      id: 3,
      title: 'Spammy post',
      body: 'Buy my stuff',
      hidden: true,
      flag_count: 3,
      reasons: { spam: 3 },
      created_at: new Date().toISOString(),
    },
  ],
  comments: [],
}

export const mockAdminUsers = [
  { id: 1, name: 'Alice', username: 'alice', email: 'alice@example.com', role: 'admin', joined_at: new Date('2025-01-01').toISOString(), post_count: 2, comment_count: 3 },
  { id: 2, name: 'Bob', username: 'bob', email: 'bob@example.com', role: 'member', joined_at: new Date('2025-02-01').toISOString(), post_count: 1, comment_count: 4 },
]

export const mockTags = [
  { id: 1, name: 'Money', slug: 'money', post_count: 2 },
  { id: 2, name: 'Career', slug: 'career', post_count: 0 },
  { id: 3, name: 'Mental health', slug: 'mental-health', post_count: 1 },
]

export const handlers = [
  http.post('/api/v1/auth/register', () =>
    HttpResponse.json({ user: mockUser, token: mockToken }, { status: 201 })
  ),

  http.post('/api/v1/auth/login', () =>
    HttpResponse.json({ user: mockUser, token: mockToken })
  ),

  http.delete('/api/v1/auth/logout', () =>
    HttpResponse.json({ success: true })
  ),

  http.post('/api/v1/auth/forgot_password', () =>
    HttpResponse.json({ success: true })
  ),

  http.post('/api/v1/auth/reset_password', () =>
    HttpResponse.json({ success: true })
  ),

  http.get('/api/v1/posts', () =>
    HttpResponse.json([mockPost])
  ),

  http.get('/api/v1/tags', () =>
    HttpResponse.json(mockTags)
  ),

  http.get('/api/v1/posts/:id', () =>
    HttpResponse.json({ ...mockPost, comments: [mockComment] })
  ),

  http.post('/api/v1/posts', () =>
    HttpResponse.json(mockPost, { status: 201 })
  ),

  http.post('/api/v1/posts/:postId/comments', () =>
    HttpResponse.json(mockComment, { status: 201 })
  ),

  http.get('/api/v1/users/:id', () =>
    HttpResponse.json(mockProfile)
  ),

  http.post('/api/v1/posts/:postId/helpful_mark', () =>
    HttpResponse.json({ helpful_count: 1, viewer_marked: true }, { status: 201 })
  ),

  http.delete('/api/v1/posts/:postId/helpful_mark', () =>
    HttpResponse.json({ helpful_count: 0, viewer_marked: false })
  ),

  http.post('/api/v1/comments/:commentId/helpful_mark', () =>
    HttpResponse.json({ helpful_count: 1, viewer_marked: true }, { status: 201 })
  ),

  http.delete('/api/v1/comments/:commentId/helpful_mark', () =>
    HttpResponse.json({ helpful_count: 0, viewer_marked: false })
  ),

  http.post('/api/v1/posts/:postId/flag', () =>
    HttpResponse.json({ flagged: true }, { status: 201 })
  ),

  http.post('/api/v1/comments/:commentId/flag', () =>
    HttpResponse.json({ flagged: true }, { status: 201 })
  ),

  http.get('/api/v1/notifications', () =>
    HttpResponse.json(mockNotifications)
  ),

  http.patch('/api/v1/notifications/read_all', () =>
    HttpResponse.json({ unread_count: 0 })
  ),

  http.patch('/api/v1/profile', () =>
    HttpResponse.json({ id: 1, name: 'Alice B', username: 'alice', email: 'aliceb@example.com', bio: 'Updated bio.', email_digest_enabled: true })
  ),

  http.patch('/api/v1/profile/password', () =>
    HttpResponse.json({ success: true })
  ),

  http.delete('/api/v1/profile', () =>
    HttpResponse.json({ deleted: true })
  ),

  http.get('/api/v1/admin/stats', () =>
    HttpResponse.json(mockAdminStats)
  ),

  http.get('/api/v1/admin/flags', () =>
    HttpResponse.json(mockAdminFlags)
  ),

  http.get('/api/v1/admin/users', () =>
    HttpResponse.json(mockAdminUsers)
  ),

  http.patch('/api/v1/admin/:target/:id/restore', () =>
    HttpResponse.json({ restored: true })
  ),

  http.delete('/api/v1/admin/posts/:id', () =>
    HttpResponse.json({ deleted: true })
  ),

  http.delete('/api/v1/admin/comments/:id', () =>
    HttpResponse.json({ deleted: true })
  ),

  http.patch('/api/v1/admin/users/:id/role', () =>
    HttpResponse.json({ ...mockAdminUsers[1], role: 'admin' })
  ),

  http.post('/api/v1/admin/users/:id/impersonate', () =>
    HttpResponse.json({ user: { id: 2, name: 'Bob', username: 'bob', email: 'bob@example.com', role: 'member' }, token: 'impersonation-token' })
  ),

  http.delete('/api/v1/admin/users/:id', () =>
    HttpResponse.json({ deleted: true })
  ),
]
