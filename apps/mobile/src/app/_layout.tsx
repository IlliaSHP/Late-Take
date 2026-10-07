import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DarkTheme, Stack, ThemeProvider } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import '@/lib/api'
import '@/lib/reactotron'
import { colors } from '@app/tokens'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000 // 1min
    }
  }
})

export const unstable_settings = {
  anchor: '(tabs)' // під шторкою/модалкою завжди лежать вкладки
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ThemeProvider value={DarkTheme}>
          <StatusBar style='light' />
          <Stack screenOptions={{ headerShown: false }} >
            {/* Явний порядок: на Android без нього стек стартує з першого оголошеного екрана (шторки), а не з вкладок */}
            <Stack.Screen name='(tabs)' />
            
            {/* Налаштування лише для роуту app/share/[key].tsx:
                відкривається шторкою знизу поверх поточного екрана, а не окремою сторінкою */}
            <Stack.Screen
              name='share/[key]'
              options={{
                presentation: 'formSheet', // шторка знизу, попередній екран видно позаду
                // Висоти, на яких зупиняється шторка (частки екрана): відкривається на 60%, тягнеться до 100%.
                // На відміну від 'fitToContents' (висота = вміст), не стрибає при відкритті клавіатури чи зміні Input.
                sheetAllowedDetents: [0.6, 1],
                sheetGrabberVisible: true,  // смужка-ручка зверху, щоб тягнути шторку вниз
                contentStyle: {backgroundColor: colors.bg.base}  // фон з токенів замість фону теми
              }}
            />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  )
}
