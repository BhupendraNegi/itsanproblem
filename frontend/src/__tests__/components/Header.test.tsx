import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/renderWithProviders'
import { Header } from '../../components/Header'
import type { User } from '../../types'

const mockUser: User = { id: 42, name: 'Alice', username: 'alice', email: 'alice@example.com', role: 'member' }
const staffUser: User = { ...mockUser, role: 'admin' }

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

  it('puts the theme picker first in the menu and switches themes', async () => {
    const { useTheme } = await import('../../store')
    useTheme.setState({ pref: 'system' })
    renderWithProviders(<Header user={mockUser} onLogout={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /alice/i }))

    expect(screen.getByRole('radiogroup', { name: 'Theme' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('radio', { name: 'Dark' }))
    expect(useTheme.getState().pref).toBe('dark')
    // menu stays open so the switch is visible
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('opens the user menu with Profile, Settings, and Log out', async () => {
    renderWithProviders(<Header user={mockUser} onLogout={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /alice/i }))

    const profile = screen.getByRole('menuitem', { name: 'Profile' })
    expect(profile).toHaveAttribute('href', '/users/alice')
    expect(screen.getByRole('menuitem', { name: 'Settings' })).toHaveAttribute('href', '/settings')
    expect(screen.getByRole('menuitem', { name: 'Log out' })).toBeInTheDocument()
    // no Admin entry for members
    expect(screen.queryByRole('menuitem', { name: 'Admin' })).not.toBeInTheDocument()
  })

  it('shows the Admin entry for staff', async () => {
    renderWithProviders(<Header user={staffUser} onLogout={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /alice/i }))
    expect(screen.getByRole('menuitem', { name: 'Admin' })).toHaveAttribute('href', '/admin')
  })

  it('calls onLogout from the menu and closes it', async () => {
    const onLogout = vi.fn()
    renderWithProviders(<Header user={mockUser} onLogout={onLogout} />)
    await userEvent.click(screen.getByRole('button', { name: /alice/i }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Log out' }))
    expect(onLogout).toHaveBeenCalledOnce()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('closes the menu when clicking outside', async () => {
    renderWithProviders(<Header user={mockUser} onLogout={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /alice/i }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    await userEvent.click(document.body)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
