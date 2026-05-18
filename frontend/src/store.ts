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
