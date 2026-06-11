import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/renderWithProviders'
import { SettingsPage } from '../../pages/SettingsPage'
import { useTheme } from '../../store'

const currentUser = { id: 1, name: 'Alice', email: 'alice@example.com' }

function renderSettings() {
  return renderWithProviders(<SettingsPage currentUser={currentUser} onLogout={vi.fn()} />)
}

describe('SettingsPage', () => {
  beforeEach(() => {
    useTheme.setState({ pref: 'system' })
  })

  it('renders the three sections', () => {
    renderSettings()
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Password' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Appearance' })).toBeInTheDocument()
  })

  it('prefills name and email from the current user', () => {
    renderSettings()
    expect(screen.getByLabelText('Name')).toHaveValue('Alice')
    expect(screen.getByLabelText('Email')).toHaveValue('alice@example.com')
  })

  it('prefills the username from the profile API', async () => {
    renderSettings()
    // the field renders empty first, then fills when the profile loads
    await waitFor(() => expect(screen.getByLabelText('Username')).toHaveValue('alice'))
  })

  it('saves the profile and shows confirmation', async () => {
    renderSettings()
    await userEvent.click(screen.getByRole('button', { name: /save profile/i }))
    expect(await screen.findByText('Profile updated')).toBeInTheDocument()
  })

  it('changes the password and clears the form', async () => {
    renderSettings()
    await userEvent.type(screen.getByLabelText('Current password'), 'oldpass123')
    await userEvent.type(screen.getByLabelText('New password'), 'newpass456')
    await userEvent.type(screen.getByLabelText('Confirm new password'), 'newpass456')
    await userEvent.click(screen.getByRole('button', { name: /change password/i }))
    expect(await screen.findByText('Password changed')).toBeInTheDocument()
    expect(screen.getByLabelText('Current password')).toHaveValue('')
  })

  it('renders the email digest toggle prefilled from the profile', async () => {
    renderSettings()
    const toggle = await screen.findByRole('checkbox', { name: /email me a daily digest/i })
    expect(toggle).toBeChecked()
  })

  it('toggles the email digest preference', async () => {
    renderSettings()
    const toggle = await screen.findByRole('checkbox', { name: /email me a daily digest/i })
    await userEvent.click(toggle)
    expect(toggle).not.toBeChecked()
  })

  it('deletes the account after password + confirm, then logs out', async () => {
    const onLogout = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderWithProviders(<SettingsPage currentUser={currentUser} onLogout={onLogout} />)

    await userEvent.type(screen.getByLabelText('Confirm with your password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /delete my account/i }))

    await waitFor(() => expect(onLogout).toHaveBeenCalledOnce())
  })

  it('switches the theme preference', async () => {
    renderSettings()
    await userEvent.click(screen.getByRole('radio', { name: 'Dark' }))
    expect(useTheme.getState().pref).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(screen.getByRole('radio', { name: 'Dark' })).toHaveAttribute('aria-checked', 'true')
  })
})
