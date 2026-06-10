import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders } from '../../test/renderWithProviders'
import { AdminPage } from '../../pages/AdminPage'
import type { User } from '../../types'

const adminUser: User = { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' }
const memberUser: User = { id: 2, name: 'Bob', email: 'bob@example.com', role: 'member' }

function renderAdmin(user: User) {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<div>feed home</div>} />
      <Route path="/admin" element={<AdminPage currentUser={user} onLogout={vi.fn()} />} />
    </Routes>,
    { routerProps: { initialEntries: ['/admin'] } }
  )
}

describe('AdminPage', () => {
  it('redirects non-admins to the feed', () => {
    renderAdmin(memberUser)
    expect(screen.getByText('feed home')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Admin' })).not.toBeInTheDocument()
  })

  it('shows site stats for admins', async () => {
    renderAdmin(adminUser)
    expect(await screen.findByText('4')).toBeInTheDocument()
    expect(screen.getByText('users')).toBeInTheDocument()
    expect(screen.getByText('flags')).toBeInTheDocument()
  })

  it('lists flagged content with restore/delete actions', async () => {
    renderAdmin(adminUser)
    expect(await screen.findByText('Spammy post')).toBeInTheDocument()
    expect(screen.getByText(/spam ×3/)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Restore' }).length).toBeGreaterThan(0)
  })

  it('lists users with impersonate and role actions for others', async () => {
    renderAdmin(adminUser)
    expect(await screen.findByText(/bob@example\.com/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Impersonate' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Make admin' })).toBeInTheDocument()
  })
})
