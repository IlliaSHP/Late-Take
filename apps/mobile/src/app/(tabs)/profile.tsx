import { useQueryClient } from '@tanstack/react-query'
import { Redirect, router } from 'expo-router'
import { LogOut } from 'lucide-react-native'
import { ScrollView } from 'react-native'

import { space } from '@app/tokens'

import { useAuthMobileLogout, useUserFindMe } from '@app/api'

import { ProfileHeader } from '@/components/profile/ProfieHeader'
import { ProfileMenuItem } from '@/components/profile/ProfileMenuItem'
import { PROFILE_MENU } from '@/components/profile/profile-menu.data'
import { Screen } from '@/components/ui/Screen'

import { clearTokens, getRefreshToken } from '@/lib/token'

export default function Profile() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useUserFindMe()

  const { mutate: logout, isPending } = useAuthMobileLogout({
    mutation: {
      onSettled: async () => {
        await clearTokens()
        queryClient.clear()
        router.replace('/login')
      }
    }
  })

  const handleLogout = async () => {
    const refreshToken = await getRefreshToken()
    if (!refreshToken) return
    logout({ data: { refreshToken } })
  }

  if (isLoading) return <Screen />

  if (isError || !data) return <Redirect href='/login' />

  return (
    <Screen edges={[]}>
      <ProfileHeader
        name={data.data.username}
        avatarUrl={data.data.profile?.avatarUrl || ''}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ paddingHorizontal: space['layout-horizontal'] }}
      >
        {PROFILE_MENU.map((item) => (
          <ProfileMenuItem
            {...item}
            key={item.label}
          />
        ))}

        <ProfileMenuItem
          icon={LogOut}
          label={isPending ? 'Logging out...' : 'LogOut'}
          onPress={handleLogout}
          isLast
        />

        {/*{__DEV__ && <TokenDebug refetch={refetch} />}*/}
      </ScrollView>
    </Screen>
  )
}
