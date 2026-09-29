import { useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'

import { saveTokens } from '@/lib/token'

interface AuthResponse {
  data: {
    accessToken: string
    refreshToken: string
  }
}

export function useAuthSuccess() {
  const queryClient = useQueryClient()

  return async function handleAuthSuccess({ data: { accessToken, refreshToken } }: AuthResponse) {
    await saveTokens(accessToken, refreshToken)
    // React Query caches responses by query key (e.g. '/users/me'), not by user.
    // When the logged-in user changes, cached data still belongs to the previous
    // state: another user's profile, or 401 errors from requests made before login.
    // Clearing the cache on login, register and logout guarantees that every
    // screen fetches fresh data for the current user.
    queryClient.clear()
    router.replace('/')
  }
}
