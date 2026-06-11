import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/renderWithProviders'
import { PostCard } from '../../components/PostCard'
import type { Post } from '../../types'

const basePost: Post = {
  id: 1,
  title: 'My big problem',
  body: 'It has been going on for a while and I need advice.',
  author: 'Anonymous',
  anon_handle: 'anon_a91f',
  helpful_count: 0,
  created_at: new Date().toISOString(),
  comments: [],
}

const defaultProps = {
  post: basePost,
  commentInputs: {},
  setCommentInputs: vi.fn(),
  onCommentSubmit: vi.fn((e) => e.preventDefault()),
  isCommentLoading: false,
}

describe('PostCard', () => {
  it('renders the post title', () => {
    renderWithProviders(<PostCard {...defaultProps} />)
    expect(screen.getByText('My big problem')).toBeInTheDocument()
  })

  it('links the title to the post detail page in feed mode', () => {
    renderWithProviders(<PostCard {...defaultProps} />)
    expect(screen.getByRole('link', { name: 'My big problem' })).toHaveAttribute('href', '/posts/1')
  })

  it('renders the post body (truncated)', () => {
    renderWithProviders(<PostCard {...defaultProps} />)
    expect(screen.getByText(/it has been going on/i)).toBeInTheDocument()
  })

  it('shows the anon handle in the meta line', () => {
    renderWithProviders(<PostCard {...defaultProps} />)
    expect(screen.getByText('anon_a91f')).toBeInTheDocument()
  })

  it('shows reply count in the meta line', () => {
    renderWithProviders(<PostCard {...defaultProps} />)
    expect(screen.getByText('0 replies')).toBeInTheDocument()
  })

  it('does not show the hot badge when helpful_count < 10', () => {
    renderWithProviders(<PostCard {...defaultProps} />)
    expect(screen.queryByText(/mark helpful · 0/i)).not.toBeInTheDocument()
    // flame badge should not appear
    expect(document.querySelector('.hot-badge')).toBeNull()
  })

  it('shows the hot badge when helpful_count >= 10', () => {
    const hotPost = { ...basePost, helpful_count: 12 }
    renderWithProviders(<PostCard {...defaultProps} post={hotPost} />)
    expect(document.querySelector('.hot-badge')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    renderWithProviders(<PostCard {...defaultProps} />)
    expect(screen.getByRole('button', { name: /mark helpful/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /flag/i })).toBeInTheDocument()
  })

  it('shows "No comments yet" when there are no comments', () => {
    renderWithProviders(<PostCard {...defaultProps} />)
    expect(screen.getByText('No comments yet')).toBeInTheDocument()
  })

  it('renders existing comments with author links', () => {
    const postWithComment: Post = {
      ...basePost,
      comments: [{ id: 1, body: 'Great advice here.', author: 'Bob', author_id: 2, created_at: new Date().toISOString() }],
    }
    renderWithProviders(<PostCard {...defaultProps} post={postWithComment} />)
    expect(screen.getByText('Great advice here.')).toBeInTheDocument()
    const authorLink = screen.getByRole('link', { name: 'Bob' })
    expect(authorLink).toHaveAttribute('href', '/users/2')
  })

  it('renders the comment form', () => {
    renderWithProviders(<PostCard {...defaultProps} />)
    expect(screen.getByPlaceholderText(/write something useful/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /post reply/i })).toBeInTheDocument()
  })

  it('disables the Post Reply button when comment input is empty', () => {
    renderWithProviders(<PostCard {...defaultProps} commentInputs={{}} />)
    expect(screen.getByRole('button', { name: /post reply/i })).toBeDisabled()
  })

  it('shows the marked state when the viewer already marked the post', () => {
    const markedPost = { ...basePost, helpful_count: 3, viewer_marked: true }
    renderWithProviders(<PostCard {...defaultProps} post={markedPost} />)
    const button = screen.getByRole('button', { name: /marked helpful · 3/i })
    expect(button).toHaveClass('is-active')
  })

  it('sends a helpful mark when the button is clicked', async () => {
    renderWithProviders(<PostCard {...defaultProps} />)
    const button = screen.getByRole('button', { name: /mark helpful/i })
    await userEvent.click(button)
    // MSW handles POST /posts/:id/helpful_mark; onUnhandledRequest: 'error'
    // would fail this test if the wrong request were sent.
    expect(button).toBeEnabled()
  })

  it('opens a reason picker when Flag is clicked, then shows Reported', async () => {
    renderWithProviders(<PostCard {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /flag/i }))
    expect(screen.getByRole('button', { name: 'Spam' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Harmful' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Identifying info' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Spam' }))
    expect(await screen.findByText(/reported/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^flag$/i })).not.toBeInTheDocument()
  })

  it('renders OP comments (null author_id) without a profile link', () => {
    const postWithOpComment: Post = {
      ...basePost,
      comments: [{ id: 9, body: 'Thanks everyone, update inside.', author: 'anon_a91f', author_id: null, created_at: new Date().toISOString() }],
    }
    renderWithProviders(<PostCard {...defaultProps} post={postWithOpComment} />)
    expect(screen.getAllByText('anon_a91f').length).toBeGreaterThan(0)
    expect(screen.queryByRole('link', { name: 'anon_a91f' })).not.toBeInTheDocument()
  })

  it('renders a helpful button on each comment', () => {
    const postWithComment: Post = {
      ...basePost,
      comments: [{ id: 1, body: 'Great advice here.', author: 'Bob', author_id: 2, helpful_count: 2, viewer_marked: true, created_at: new Date().toISOString() }],
    }
    renderWithProviders(<PostCard {...defaultProps} post={postWithComment} />)
    const button = screen.getByRole('button', { name: /helpful · 2/i })
    expect(button).toHaveClass('is-active')
  })
})
