import axios from 'axios'
import type { AuthResponse, Post, UserProfile } from './types'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  let token: string | null = null
  try { token = localStorage.getItem('authToken') } catch { /* no-op */ }
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function register(data: { name: string; email: string; password: string; passwordConfirmation: string }) {
  const response = await api.post<AuthResponse>('/auth/register', {
    user: {
      name: data.name,
      email: data.email,
      password: data.password,
      password_confirmation: data.passwordConfirmation,
    },
  })
  return response.data
}

export async function login(data: { email: string; password: string }) {
  const response = await api.post<AuthResponse>('/auth/login', data)
  return response.data
}

export async function fetchPosts() {
  const response = await api.get<Post[]>('/posts')
  return response.data
}

export async function createPost(data: { title: string; body: string }) {
  const response = await api.post<Post>('/posts', { post: data })
  return response.data
}

export async function createComment(postId: number, data: { body: string }) {
  const response = await api.post(`/posts/${postId}/comments`, { comment: data })
  return response.data
}

export async function fetchUserProfile(userId: number) {
  const response = await api.get<UserProfile>(`/users/${userId}`)
  return response.data
}
