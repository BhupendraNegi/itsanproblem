import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/renderWithProviders'
import { NotificationBell } from '../../components/NotificationBell'

describe('NotificationBell', () => {
  it('shows the unread count badge', async () => {
    renderWithProviders(<NotificationBell />)
    expect(await screen.findByText('1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /notifications, 1 unread/i })).toBeInTheDocument()
  })

  it('opens the dropdown with notification messages', async () => {
    renderWithProviders(<NotificationBell />)
    await screen.findByText('1')
    await userEvent.click(screen.getByRole('button', { name: /notifications/i }))
    expect(screen.getByText(/someone replied to “my problem”/i)).toBeInTheDocument()
  })
})
