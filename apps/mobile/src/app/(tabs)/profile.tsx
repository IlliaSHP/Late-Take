import { useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Text, View } from 'react-native'

import { colors, fontSize, space } from '@app/tokens'

import { useAuthMobileLogout, useUserFindMe } from '@app/api'

import Button from '@/components/ui/Button'
import { Screen } from '@/components/ui/Screen'

import { clearTokens, getRefreshToken } from '@/lib/token'

export default function Profile() {
  const queryClient = useQueryClient()
  const { data } = useUserFindMe()

  const { mutate: logout, isPending } = useAuthMobileLogout({
    mutation: {
      onSettled: async () => {
        await clearTokens()
        queryClient.clear()
        router.replace('/register')
      }
    }
  })

  const handleLogout = async () => {
    const refreshToken = await getRefreshToken()
    if (!refreshToken) return
    logout({ data: { refreshToken } })
  }

  return (
    <Screen>
      <View style={{ padding: space['layout-horizontal'], gap: space[4] }}>
        <Text style={{ color: colors.text.primary, fontSize: fontSize.xl }}>
          {data?.data.email}
        </Text>

        <Button
          variant='secondary'
          onPress={handleLogout}
          isDisabled={isPending}
        >
          Sign out
        </Button>
      </View>
    </Screen>
  )
}
