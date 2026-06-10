import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '../api'
import type { AuthResponse, NotificationsResponse, Post, User, Comment, UserProfile } from '../types'

type AuthFields = {
  name: string
  email: string
  password: string
  passwordConfirmation: string
}

export function useAuthMutation(
  setAlertMessage: (message: string | null) => void,
  setAuthFields: (fields: AuthFields) => void,
  login: (user: User, token: string) => void
) {
  return useMutation<AuthResponse, Error, { mode: 'login' | 'register'; fields: AuthFields }>({
    mutationFn: async ({ mode, fields }) => {
      if (mode === 'register') {
        return api.register({
          name: fields.name,
          email: fields.email,
          password: fields.password,
          passwordConfirmation: fields.passwordConfirmation,
        })
      }
      return api.login({ email: fields.email, password: fields.password })
    },
    onSuccess: (data) => {
      login(data.user, data.token)
      setAlertMessage(null)
      setAuthFields({ name: '', email: '', password: '', passwordConfirmation: '' })
    },
    onError: (error: Error) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiError = error as any
      const message = apiError?.response?.data?.error || apiError?.response?.data?.errors?.join(', ') || 'Registration failed'
      setAlertMessage(message)
    },
  })
}

export function usePostMutation(
  setAlertMessage: (message: string | null) => void,
  setPostTitle: (title: string) => void,
  setPostBody: (body: string) => void
) {
  const queryClient = useQueryClient()

  return useMutation<Post, Error, { title: string; body: string }>({
    mutationFn: api.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      setPostTitle('')
      setPostBody('')
      setAlertMessage('Post created successfully')
    },
    onError: (error: Error) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const message = (error as any)?.response?.data?.error || (error as any)?.response?.data?.errors?.join(', ') || 'Failed to create post'
      setAlertMessage(message)
    },
  })
}

export function useCommentMutation(
  setAlertMessage: (message: string | null) => void,
  setCommentInputs: (inputs: Record<number, string> | ((current: Record<number, string>) => Record<number, string>)) => void
) {
  const queryClient = useQueryClient()

  return useMutation<Comment, Error, { postId: number; body: string }>({
    mutationFn: ({ postId, body }) => api.createComment(postId, { body }),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      setCommentInputs((current: Record<number, string>) => ({ ...current, [postId]: '' }))
      setAlertMessage('Comment added successfully')
    },
    onError: () => {
      setAlertMessage('Failed to add comment')
    },
  })
}

export function useHelpfulMutation() {
  const queryClient = useQueryClient()

  return useMutation<{ helpful_count: number; viewer_marked: boolean }, Error, { target: 'posts' | 'comments'; id: number; marked: boolean }>({
    mutationFn: ({ target, id, marked }) => api.toggleHelpful(target, id, marked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function useFlagMutation() {
  const queryClient = useQueryClient()

  return useMutation<{ flagged: boolean }, Error, { target: 'posts' | 'comments'; id: number; reason: string }>({
    mutationFn: ({ target, id, reason }) => api.flagContent(target, id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function usePosts(sort: 'recent' | 'hot' = 'recent') {
  return useQuery<Post[]>({
    queryKey: ['posts', sort],
    queryFn: () => api.fetchPosts(sort),
  })
}

export function useNotifications() {
  return useQuery<NotificationsResponse>({
    queryKey: ['notifications'],
    queryFn: api.fetchNotifications,
    refetchInterval: 30_000,
  })
}

export function useReadAllNotifications() {
  const queryClient = useQueryClient()

  return useMutation<{ unread_count: number }, Error, void>({
    mutationFn: api.markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useUserProfile(userId: number) {
  return useQuery<UserProfile>({
    queryKey: ['user', userId],
    queryFn: () => api.fetchUserProfile(userId),
    enabled: !!userId,
  })
}
