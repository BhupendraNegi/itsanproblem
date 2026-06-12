import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders } from '../../test/renderWithProviders'
import { ProfilePage } from '../../pages/ProfilePage'
import { mockProfile } from '../../mocks/handlers'

const currentUser = { id: 1, name: 'Alice', email: 'alice@example.com' }
const otherUser = { id: 99, name: 'Bob', email: 'bob@example.com' }

function renderProfile(user = currentUser) {
  return renderWithProviders(
    <Routes>
      <Route path="/users/:handle" element={<ProfilePage currentUser={user} onLogout={vi.fn()} />} />
    </Routes>,
    { routerProps: { initialEntries: ['/users/alice'] } }
  )
}

describe('ProfilePage', () => {
  it('shows a loading state initially', () => {
    renderProfile()
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('renders the profile name after data loads', async () => {
    renderProfile()
    expect(await screen.findByRole('heading', { name: /alice/i })).toBeInTheDocument()
  })

  it('shows the "you" badge when viewing own profile', async () => {
    renderProfile(currentUser)
    expect(await screen.findByText('you')).toBeInTheDocument()
  })

  it('does not show the "you" badge on another user\'s profile', async () => {
    renderProfile(otherUser)
    await screen.findByRole('heading', { name: /alice/i })
    expect(screen.queryByText('you')).not.toBeInTheDocument()
  })

  it('displays helpful_points stat', async () => {
    renderProfile()
    expect(await screen.findByText(String(mockProfile.helpful_points))).toBeInTheDocument()
    expect(screen.getByText('helpful points')).toBeInTheDocument()
  })

  it('displays comment_count stat', async () => {
    renderProfile()
    await screen.findByText(String(mockProfile.comment_count))
    expect(screen.getByText('replies written')).toBeInTheDocument()
  })

  it('renders recent reply body text', async () => {
    renderProfile()
    expect(await screen.findByText('This helped me too.')).toBeInTheDocument()
  })

  it('shows the post title in the reply meta', async () => {
    renderProfile()
    expect(await screen.findByText('My problem')).toBeInTheDocument()
  })

  it('shows "No replies yet" when recent_comments is empty', async () => {
    const { server } = await import('../../mocks/server')
    const { http, HttpResponse } = await import('msw')
    server.use(
      http.get('/api/v1/users/:id', () =>
        HttpResponse.json({ ...mockProfile, recent_comments: [] })
      )
    )
    renderProfile()
    expect(await screen.findByText('No replies yet')).toBeInTheDocument()
  })

  it('renders a breadcrumb back to the feed', () => {
    renderProfile()
    expect(screen.getByRole('link', { name: /feed/i })).toHaveAttribute('href', '/')
  })

  it('shows the @username in the profile meta', async () => {
    renderProfile()
    // appears in both the breadcrumb and the profile meta line
    expect((await screen.findAllByText(/@alice/)).length).toBeGreaterThan(0)
  })

  it('renders the bio when present', async () => {
    renderProfile()
    expect(await screen.findByText('Just here to help.')).toBeInTheDocument()
  })

  it('shows "Your posts" with anon handles when the API returns own posts', async () => {
    renderProfile()
    expect(await screen.findByText('Your posts')).toBeInTheDocument()
    expect(screen.getByText('My secret problem')).toBeInTheDocument()
    expect(screen.getByText(/anonymous posts appear here only for you/i)).toBeInTheDocument()
  })

  it('hides the "Your posts" section when the API omits posts', async () => {
    const { server } = await import('../../mocks/server')
    const { http, HttpResponse } = await import('msw')
    const withoutPosts = { ...mockProfile, posts: undefined }
    server.use(
      http.get('/api/v1/users/:id', () => HttpResponse.json(withoutPosts))
    )
    renderProfile(otherUser)
    await screen.findByRole('heading', { name: /alice/i })
    expect(screen.queryByText('Your posts')).not.toBeInTheDocument()
  })
})
