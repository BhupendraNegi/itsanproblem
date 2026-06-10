import { http, HttpResponse } from 'msw'

export const mockUser = { id: 1, name: 'Alice', email: 'alice@example.com' }
export const mockToken = 'mock-jwt-token'

export const mockPost = {
  id: 1,
  title: 'My problem',
  body: 'It is really bad and I need help.',
  author: 'Anonymous',
  anon_handle: 'anon_a91f',
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
  created_at: new Date().toISOString(),
}

export const mockProfile = {
  id: 1,
  name: 'Alice',
  joined_at: new Date('2025-01-01').toISOString(),
  helpful_points: 5,
  comment_count: 3,
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

  http.get('/api/v1/posts', () =>
    HttpResponse.json([mockPost])
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
]
