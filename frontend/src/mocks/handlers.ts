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
]
