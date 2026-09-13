import { router, useLocalSearchParams } from 'expo-router'
import { Pressable, Text } from 'react-native'

import { Screen } from '@/components/Screen'

export default function TitleDetail() {
  const { id, type } = useLocalSearchParams<{ id: string; type: string }>()

  return (
    <Screen>
      <Text>
        Title {type} {id}
      </Text>
      <Pressable onPress={() => router.back()}>
        <Text>Back</Text>
      </Pressable>
    </Screen>
  )
}
