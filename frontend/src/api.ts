import axios from 'axios'
import type {
  AdminFlagsResponse,
  AdminStats,
  AdminUser,
  AuthResponse,
  NotificationsResponse,
  Post,
  Role,
  User,
  UserProfile,
} from './types'

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

export async function register(data: { name: string; username?: string; email: string; password: string; passwordConfirmation: string }) {
  const response = await api.post<AuthResponse>('/auth/register', {
    user: {
      name: data.name,
      // blank → the backend derives one from the name
      ...(data.username?.trim() ? { username: data.username.trim() } : {}),
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

export async function fetchPosts(sort: 'recent' | 'hot' = 'recent') {
  const response = await api.get<Post[]>('/posts', {
    params: sort === 'hot' ? { sort } : undefined,
  })
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

export async function toggleHelpful(target: 'posts' | 'comments', id: number, marked: boolean) {
  const url = `/${target}/${id}/helpful_mark`
  const response = marked ? await api.delete(url) : await api.post(url)
  return response.data as { helpful_count: number; viewer_marked: boolean }
}

export async function flagContent(target: 'posts' | 'comments', id: number, reason: string) {
  const response = await api.post(`/${target}/${id}/flag`, { flag: { reason } })
  return response.data as { flagged: boolean }
}

export type ProfileUpdate = {
  name?: string
  username?: string
  email?: string
  bio?: string
  email_digest_enabled?: boolean
}

export async function updateProfile(data: ProfileUpdate) {
  const response = await api.patch<User & { bio: string | null; email_digest_enabled: boolean }>('/profile', { user: data })
  return response.data
}

export async function changePassword(data: { currentPassword: string; password: string; passwordConfirmation: string }) {
  const response = await api.patch<{ success: boolean }>('/profile/password', {
    user: {
      current_password: data.currentPassword,
      password: data.password,
      password_confirmation: data.passwordConfirmation,
    },
  })
  return response.data
}

export async function fetchNotifications() {
  const response = await api.get<NotificationsResponse>('/notifications')
  return response.data
}

export async function markAllNotificationsRead() {
  const response = await api.patch<{ unread_count: number }>('/notifications/read_all')
  return response.data
}

// handle = username; numeric ids still resolve for old links
export async function fetchUserProfile(handle: string) {
  const response = await api.get<UserProfile>(`/users/${handle}`)
  return response.data
}

// ---- Admin (requires an admin token; backend enforces via ActionPolicy) ----

export async function fetchAdminStats() {
  const response = await api.get<AdminStats>('/admin/stats')
  return response.data
}

export async function fetchAdminFlags() {
  const response = await api.get<AdminFlagsResponse>('/admin/flags')
  return response.data
}

export async function fetchAdminUsers(q: string) {
  const response = await api.get<AdminUser[]>('/admin/users', { params: q ? { q } : undefined })
  return response.data
}

export async function adminRestoreContent(target: 'posts' | 'comments', id: number) {
  const response = await api.patch<{ restored: boolean }>(`/admin/${target}/${id}/restore`)
  return response.data
}

export async function adminDeleteContent(target: 'posts' | 'comments', id: number) {
  const response = await api.delete<{ deleted: boolean }>(`/admin/${target}/${id}`)
  return response.data
}

export async function adminSetUserRole(id: number, role: Role) {
  const response = await api.patch<AdminUser>(`/admin/users/${id}/role`, { role })
  return response.data
}

export async function adminImpersonateUser(id: number) {
  const response = await api.post<AuthResponse>(`/admin/users/${id}/impersonate`)
  return response.data
}

export async function adminDeleteUser(id: number) {
  const response = await api.delete<{ deleted: boolean }>(`/admin/users/${id}`)
  return response.data
}
