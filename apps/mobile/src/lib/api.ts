import * as SecureStore from 'expo-secure-store' // SecureStore is Expo's mobile equivalent of localStorage.

import { configureApi } from '@app/api'

configureApi({
  baseUrl: process.env.EXPO_PUBLIC_API_URL!,
  getToken: () => SecureStore.getItemAsync('accessToken')
})
