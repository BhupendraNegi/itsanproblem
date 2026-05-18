import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/renderWithProviders'
import { Header } from '../../components/Header'

const mockUser = { id: 42, name: 'Alice', email: 'alice@example.com' }

describe('Header', () => {
  it('renders the brand name', () => {
    renderWithProviders(<Header user={mockUser} onLogout={vi.fn()} />)
    expect(screen.getByText(/it's an problem/i)).toBeInTheDocument()
  })

  it('shows the logged-in user name', () => {
    renderWithProviders(<Header user={mockUser} onLogout={vi.fn()} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('shows the user initial in the avatar', () => {
    renderWithProviders(<Header user={mockUser} onLogout={vi.fn()} />)
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('user pill links to the current user profile', () => {
    renderWithProviders(<Header user={mockUser} onLogout={vi.fn()} />)
    const link = screen.getByRole('link', { name: /alice/i })
    expect(link).toHaveAttribute('href', '/users/42')
  })

  it('calls onLogout when the logout button is clicked', async () => {
    const onLogout = vi.fn()
    renderWithProviders(<Header user={mockUser} onLogout={onLogout} />)
    await userEvent.click(screen.getByRole('button', { name: /log out/i }))
    expect(onLogout).toHaveBeenCalledOnce()
  })
})
