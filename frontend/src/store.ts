import { create } from 'zustand'
import type { User } from './types'

type AuthState = {
  user: User | null
  token: string | null
  // the staff session to return to while impersonating someone
  impersonator: { user: User; token: string } | null
  login: (user: User, token: string) => void
  logout: () => void
  startImpersonation: (user: User, token: string) => void
  stopImpersonation: () => void
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

const getSavedImpersonator = () => {
  try {
    const user = localStorage.getItem('impersonatorUser')
    const token = localStorage.getItem('impersonatorToken')
    return user && token ? { user: JSON.parse(user) as User, token } : null
  } catch {
    return null
  }
}

const persistSession = (user: User, token: string) => {
  try {
    localStorage.setItem('authUser', JSON.stringify(user))
    localStorage.setItem('authToken', token)
  } catch { /* no-op */ }
}

const useAuth = create<AuthState>((set, get) => ({
  user: getSavedUser(),
  token: getSavedToken(),
  impersonator: getSavedImpersonator(),
  login: (user, token) => {
    persistSession(user, token)
    set({ user, token })
  },
  logout: () => {
    try {
      localStorage.removeItem('authUser')
      localStorage.removeItem('authToken')
      localStorage.removeItem('impersonatorUser')
      localStorage.removeItem('impersonatorToken')
    } catch { /* no-op */ }
    set({ user: null, token: null, impersonator: null })
  },
  startImpersonation: (user, token) => {
    const { user: currentUser, token: currentToken, impersonator } = get()
    // Keep the original staff session even across chained impersonations.
    const original = impersonator ?? (currentUser && currentToken ? { user: currentUser, token: currentToken } : null)
    try {
      if (original) {
        localStorage.setItem('impersonatorUser', JSON.stringify(original.user))
        localStorage.setItem('impersonatorToken', original.token)
      }
    } catch { /* no-op */ }
    persistSession(user, token)
    set({ user, token, impersonator: original })
  },
  stopImpersonation: () => {
    const { impersonator } = get()
    if (!impersonator) return
    try {
      localStorage.removeItem('impersonatorUser')
      localStorage.removeItem('impersonatorToken')
    } catch { /* no-op */ }
    persistSession(impersonator.user, impersonator.token)
    set({ user: impersonator.user, token: impersonator.token, impersonator: null })
  },
}))

export default useAuth
