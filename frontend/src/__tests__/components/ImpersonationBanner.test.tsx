import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/renderWithProviders'
import { ImpersonationBanner } from '../../components/ImpersonationBanner'
import useAuth from '../../store'
import type { User } from '../../types'

const adminUser: User = { id: 1, name: 'Root', username: 'root', email: 'root@example.com', role: 'admin' }
const memberUser: User = { id: 2, name: 'Bob', username: 'bob', email: 'bob@example.com', role: 'member' }

describe('ImpersonationBanner', () => {
  beforeEach(() => {
    useAuth.setState({ user: adminUser, token: 'admin-token', impersonator: null })
  })

  it('renders nothing when not impersonating', () => {
    renderWithProviders(<ImpersonationBanner />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(document.body.classList.contains('impersonating')).toBe(false)
  })

  it('shows who is being impersonated and marks the body', () => {
    useAuth.setState({ user: memberUser, token: 'member-token', impersonator: { user: adminUser, token: 'admin-token' } })
    renderWithProviders(<ImpersonationBanner />)
    expect(screen.getByRole('status')).toHaveTextContent(/impersonating/i)
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText(/@bob/)).toBeInTheDocument()
    expect(document.body.classList.contains('impersonating')).toBe(true)
  })

  it('restores the staff session when Stop impersonating is clicked', async () => {
    useAuth.setState({ user: memberUser, token: 'member-token', impersonator: { user: adminUser, token: 'admin-token' } })
    renderWithProviders(<ImpersonationBanner />)

    await userEvent.click(screen.getByRole('button', { name: /stop impersonating/i }))

    const state = useAuth.getState()
    expect(state.user).toEqual(adminUser)
    expect(state.token).toBe('admin-token')
    expect(state.impersonator).toBeNull()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
