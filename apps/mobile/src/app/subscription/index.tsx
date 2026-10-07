import { router } from 'expo-router'
import ChevronLeft from 'lucide-react-native/icons/chevron-left'
import { Text } from 'react-native'

import { FloatingButton } from '@/components/ui/FloatingButton'
import { Screen } from '@/components/ui/Screen'

export default function Subscription() {
  return (
    <Screen>
      <FloatingButton
        onPress={() => {
          router.back()
        }}
        icon={ChevronLeft}
        side='left'
        iconOffset={-2}
      />
      <Text>Subscription</Text>
    </Screen>
  )
}
