import { ACCESS_TOKEN, REFRESH_TOKEN } from '@app/constants'
import * as SecureStore from 'expo-secure-store'

export const saveTokens = async (access: string, refresh: string) => {
  await SecureStore.setItemAsync(ACCESS_TOKEN, access)
  await SecureStore.setItemAsync(REFRESH_TOKEN, refresh)
}

export const clearTokens = async () => {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN)
  await SecureStore.deleteItemAsync(REFRESH_TOKEN)
}