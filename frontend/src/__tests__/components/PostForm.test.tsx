import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/renderWithProviders'
import { PostForm } from '../../components/PostForm'

const defaultProps = {
  title: '',
  setTitle: vi.fn(),
  body: '',
  setBody: vi.fn(),
  onSubmit: vi.fn((e) => e.preventDefault()),
  isLoading: false,
}

describe('PostForm', () => {
  it('renders the composer heading', () => {
    renderWithProviders(<PostForm {...defaultProps} />)
    expect(screen.getByText(/what's an problem/i)).toBeInTheDocument()
  })

  it('shows the posting anonymously indicator', () => {
    renderWithProviders(<PostForm {...defaultProps} />)
    expect(screen.getByText(/posting anonymously/i)).toBeInTheDocument()
  })

  it('shows the title input', () => {
    renderWithProviders(<PostForm {...defaultProps} />)
    expect(screen.getByPlaceholderText(/what's actually bothering you/i)).toBeInTheDocument()
  })

  it('textarea is hidden initially', () => {
    renderWithProviders(<PostForm {...defaultProps} />)
    expect(screen.queryByPlaceholderText(/set the scene/i)).not.toBeInTheDocument()
  })

  it('textarea appears after the title input is focused', async () => {
    renderWithProviders(<PostForm {...defaultProps} />)
    await userEvent.click(screen.getByPlaceholderText(/what's actually bothering you/i))
    expect(screen.getByPlaceholderText(/set the scene/i)).toBeInTheDocument()
  })

  it('submit button is disabled when title is empty', () => {
    renderWithProviders(<PostForm {...defaultProps} title="" body="" />)
    expect(screen.getByRole('button', { name: /post anonymously/i })).toBeDisabled()
  })

  it('submit button is enabled when both title and body are present', () => {
    renderWithProviders(<PostForm {...defaultProps} title="A problem" body="Details here." />)
    expect(screen.getByRole('button', { name: /post anonymously/i })).not.toBeDisabled()
  })

  it('shows Posting… and is disabled while loading', () => {
    renderWithProviders(<PostForm {...defaultProps} title="A problem" body="Details." isLoading={true} />)
    expect(screen.getByRole('button', { name: /posting…/i })).toBeDisabled()
  })

  it('calls setTitle when typing in the title input', async () => {
    const setTitle = vi.fn()
    renderWithProviders(<PostForm {...defaultProps} setTitle={setTitle} />)
    await userEvent.type(screen.getByPlaceholderText(/what's actually bothering you/i), 'x')
    expect(setTitle).toHaveBeenCalled()
  })
})
