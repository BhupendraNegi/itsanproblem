import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/renderWithProviders'
import { AboutPage } from '../../pages/AboutPage'
import { HelpPage } from '../../pages/HelpPage'
import { PrivacyPage } from '../../pages/PrivacyPage'
import { TermsPage } from '../../pages/TermsPage'
import { FaqPage } from '../../pages/FaqPage'
import { Footer } from '../../components/Footer'

describe('static info pages', () => {
  it('renders About with a breadcrumb back to the feed', () => {
    renderWithProviders(<AboutPage />)
    expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /feed/i })).toHaveAttribute('href', '/')
  })

  it('renders Help', () => {
    renderWithProviders(<HelpPage />)
    expect(screen.getByRole('heading', { name: 'Help' })).toBeInTheDocument()
    expect(screen.getByText(/posting a problem/i)).toBeInTheDocument()
  })

  it('renders Privacy with the honest anonymity section', () => {
    renderWithProviders(<PrivacyPage />)
    expect(screen.getByText(/what anonymity does — and doesn't — mean/i)).toBeInTheDocument()
  })

  it('renders Terms with the not-professional-advice clause', () => {
    renderWithProviders(<TermsPage />)
    expect(screen.getByText(/not professional advice/i)).toBeInTheDocument()
  })
})

describe('FAQ page', () => {
  it('renders questions collapsed and toggles answers open', async () => {
    renderWithProviders(<FaqPage />)
    const first = screen.getByText('Is anonymous really anonymous?')
    const details = first.closest('details') as HTMLDetailsElement
    expect(details.open).toBe(false)

    await userEvent.click(first)
    expect(details.open).toBe(true)
    expect(screen.getByText(/to everyone using the site, yes/i)).toBeVisible()

    await userEvent.click(first)
    expect(details.open).toBe(false)
  })

  it('renders all ten questions', () => {
    renderWithProviders(<FaqPage />)
    expect(document.querySelectorAll('details.faq-item')).toHaveLength(10)
  })
})

describe('Footer links', () => {
  it('links to all five info pages', () => {
    renderWithProviders(<Footer />)
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
    expect(screen.getByRole('link', { name: 'Help' })).toHaveAttribute('href', '/help')
    expect(screen.getByRole('link', { name: 'FAQ' })).toHaveAttribute('href', '/faq')
    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy')
    expect(screen.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms')
  })
})
