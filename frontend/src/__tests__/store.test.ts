import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'

// Node.js 22 ships a partial `localStorage` global that is `undefined` unless
// --localstorage-file is provided. Stub a fully working implementation so
// the store can be tested in the jsdom worker.
function makeLocalStorage() {
  const store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = String(value) },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]) },
    get length() { return Object.keys(store).length },
    key: (i: number) => Object.keys(store)[i] ?? null,
  }
}

beforeEach(() => {
  vi.stubGlobal('localStorage', makeLocalStorage())
})

// Import store AFTER stubbing so the singleton initialises with the stub in scope.
async function freshStore() {
  vi.resetModules()
  const { default: useAuth } = await import('../store')
  return useAuth
}

describe('useAuth store', () => {
  it('initialises with null user and token when localStorage is empty', async () => {
    const useAuth = await freshStore()
    const { user, token } = useAuth.getState()
    expect(user).toBeNull()
    expect(token).toBeNull()
  })

  it('login sets user and token in state', async () => {
    const useAuth = await freshStore()
    const user = { id: 1, name: 'Alice', email: 'alice@example.com' }
    act(() => { useAuth.getState().login(user, 'tok123') })
    const state = useAuth.getState()
    expect(state.user).toEqual(user)
    expect(state.token).toBe('tok123')
  })

  it('login persists user to localStorage', async () => {
    const useAuth = await freshStore()
    const user = { id: 1, name: 'Alice', email: 'alice@example.com' }
    act(() => { useAuth.getState().login(user, 'tok123') })
    expect(JSON.parse(localStorage.getItem('authUser')!)).toEqual(user)
    expect(localStorage.getItem('authToken')).toBe('tok123')
  })

  it('logout clears user and token from state', async () => {
    const useAuth = await freshStore()
    const user = { id: 1, name: 'Alice', email: 'alice@example.com' }
    act(() => { useAuth.getState().login(user, 'tok123') })
    act(() => { useAuth.getState().logout() })
    const state = useAuth.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
  })

  it('logout removes items from localStorage', async () => {
    const useAuth = await freshStore()
    const user = { id: 1, name: 'Alice', email: 'alice@example.com' }
    act(() => { useAuth.getState().login(user, 'tok123') })
    act(() => { useAuth.getState().logout() })
    expect(localStorage.getItem('authUser')).toBeNull()
    expect(localStorage.getItem('authToken')).toBeNull()
  })
})
