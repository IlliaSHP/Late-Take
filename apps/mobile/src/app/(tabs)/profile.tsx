import { Text } from 'react-native'

import { colors } from '@app/tokens'

import { Screen } from '@/components/Screen'

export default function Profile() {
  return (
    <Screen>
      <Text style={{ color: colors.primary }}>Profile</Text>
    </Screen>
  )
}
