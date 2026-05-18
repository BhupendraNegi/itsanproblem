import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/renderWithProviders'
import { AuthPanel } from '../../components/AuthPanel'

const defaultProps = {
  mode: 'login' as const,
  setMode: vi.fn(),
  authFields: { name: '', email: '', password: '', passwordConfirmation: '' },
  setAuthFields: vi.fn(),
  onSubmit: vi.fn((e) => e.preventDefault()),
  isLoading: false,
  error: null,
}

describe('AuthPanel', () => {
  it('renders the brand headline', () => {
    renderWithProviders(<AuthPanel {...defaultProps} />)
    expect(screen.getByText(/it's an problem/i)).toBeInTheDocument()
  })

  it('shows Sign In and Create Account tabs', () => {
    renderWithProviders(<AuthPanel {...defaultProps} />)
    expect(screen.getByRole('tab', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /create account/i })).toBeInTheDocument()
  })

  it('Sign In tab is selected by default', () => {
    renderWithProviders(<AuthPanel {...defaultProps} />)
    expect(screen.getByRole('tab', { name: /sign in/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /create account/i })).toHaveAttribute('aria-selected', 'false')
  })

  it('calls setMode with register when Create Account tab is clicked', async () => {
    const setMode = vi.fn()
    renderWithProviders(<AuthPanel {...defaultProps} setMode={setMode} />)
    await userEvent.click(screen.getByRole('tab', { name: /create account/i }))
    expect(setMode).toHaveBeenCalledWith('register')
  })

  it('shows name and confirm password fields in register mode', () => {
    renderWithProviders(<AuthPanel {...defaultProps} mode="register" />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Confirm password')).toBeInTheDocument()
  })

  it('does not show name field in login mode', () => {
    renderWithProviders(<AuthPanel {...defaultProps} mode="login" />)
    expect(screen.queryByText('Name')).not.toBeInTheDocument()
  })

  it('renders an error alert when error prop is set', () => {
    renderWithProviders(<AuthPanel {...defaultProps} error="Invalid email or password" />)
    expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
  })

  it('shows Processing… on the submit button when loading', () => {
    renderWithProviders(<AuthPanel {...defaultProps} isLoading={true} />)
    expect(screen.getByRole('button', { name: /processing/i })).toBeDisabled()
  })

  it('calls onSubmit when form is submitted', async () => {
    const onSubmit = vi.fn((e) => e.preventDefault())
    renderWithProviders(<AuthPanel {...defaultProps} onSubmit={onSubmit} />)
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }))
    expect(onSubmit).toHaveBeenCalled()
  })

  it('shows the anonymous disclaimer', () => {
    renderWithProviders(<AuthPanel {...defaultProps} />)
    expect(screen.getByText(/your posts are anonymous by default/i)).toBeInTheDocument()
  })
})
