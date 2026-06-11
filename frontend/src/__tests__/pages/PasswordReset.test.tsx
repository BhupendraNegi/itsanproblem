import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders } from '../../test/renderWithProviders'
import { ForgotPasswordPage } from '../../pages/ForgotPasswordPage'
import { ResetPasswordPage } from '../../pages/ResetPasswordPage'

describe('ForgotPasswordPage', () => {
  it('sends the request and shows a neutral confirmation', async () => {
    renderWithProviders(<ForgotPasswordPage />)
    await userEvent.type(screen.getByLabelText('Email'), 'alice@example.com')
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }))
    expect(await screen.findByText(/a reset link is on its way/i)).toBeInTheDocument()
  })
})

describe('ResetPasswordPage', () => {
  function renderWithToken(path: string) {
    return renderWithProviders(
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>,
      { routerProps: { initialEntries: [path] } }
    )
  }

  it('resets the password with a token from the URL', async () => {
    renderWithToken('/reset-password?token=abc123')
    await userEvent.type(screen.getByLabelText(/^new password/i), 'newpassword456')
    await userEvent.type(screen.getByLabelText('Confirm new password'), 'newpassword456')
    await userEvent.click(screen.getByRole('button', { name: /set new password/i }))
    expect(await screen.findByText(/password updated/i)).toBeInTheDocument()
  })

  it('warns and disables submit when the token is missing', () => {
    renderWithToken('/reset-password')
    expect(screen.getByText(/missing its token/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /set new password/i })).toBeDisabled()
  })
})
