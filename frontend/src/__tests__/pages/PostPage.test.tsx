import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders } from '../../test/renderWithProviders'
import { PostPage } from '../../pages/PostPage'

const currentUser = { id: 1, name: 'Alice', username: 'alice', email: 'alice@example.com' }

function renderPost() {
  return renderWithProviders(
    <Routes>
      <Route path="/posts/:id" element={<PostPage currentUser={currentUser} onLogout={vi.fn()} />} />
    </Routes>,
    { routerProps: { initialEntries: ['/posts/1'] } }
  )
}

describe('PostPage', () => {
  it('renders the full post with its comments', async () => {
    renderPost()
    expect(await screen.findByRole('heading', { name: 'My problem' })).toBeInTheDocument()
    expect(screen.getByText(/it is really bad/i)).toBeInTheDocument()
    expect(screen.getByText('Have you tried turning it off?')).toBeInTheDocument()
  })

  it('does not link the title to itself in expanded mode', async () => {
    renderPost()
    await screen.findByRole('heading', { name: 'My problem' })
    expect(screen.queryByRole('link', { name: 'My problem' })).not.toBeInTheDocument()
  })

  it('shows the reply form', async () => {
    renderPost()
    expect(await screen.findByPlaceholderText(/write something useful/i)).toBeInTheDocument()
  })
})
