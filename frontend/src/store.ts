import { create } from 'zustand'
import type { User } from './types'

type AuthState = {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
}

const getSavedUser = () => {
  try {
    const value = localStorage.getItem('authUser')
    return value ? JSON.parse(value) as User : null
  } catch {
    return null
  }
}

const getSavedToken = () => {
  try {
    return localStorage.getItem('authToken')
  } catch {
    return null
  }
}

export type ThemePref = 'light' | 'dark' | 'system'

type ThemeState = {
  pref: ThemePref
  setPref: (pref: ThemePref) => void
}

const prefersDark = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false

const applyTheme = (pref: ThemePref) => {
  if (typeof document === 'undefined') return
  const dark = pref === 'dark' || (pref === 'system' && prefersDark())
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
}

const getSavedThemePref = (): ThemePref => {
  try {
    const value = localStorage.getItem('themePref')
    if (value === 'light' || value === 'dark') return value
  } catch { /* no-op */ }
  return 'system'
}

export const useTheme = create<ThemeState>((set) => ({
  pref: getSavedThemePref(),
  setPref: (pref) => {
    try { localStorage.setItem('themePref', pref) } catch { /* no-op */ }
    applyTheme(pref)
    set({ pref })
  },
}))

// Resolve the theme on load, and keep following the OS while in system mode.
applyTheme(getSavedThemePref())
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (useTheme.getState().pref === 'system') applyTheme('system')
  })
}

const useAuth = create<AuthState>((set) => ({
  user: getSavedUser(),
  token: getSavedToken(),
  login: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authUser', JSON.stringify(user))
      localStorage.setItem('authToken', token)
    }
    set({ user, token })
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authUser')
      localStorage.removeItem('authToken')
    }
    set({ user: null, token: null })
  },
}))

export default useAuth
