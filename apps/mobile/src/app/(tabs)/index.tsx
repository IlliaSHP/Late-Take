import { Download, Play, Plus } from 'lucide-react-native'
import { StyleSheet, Text, View } from 'react-native'

import { MEDIA_TYPES } from '@app/types'

import { TYPE_LABELS } from '@app/constants'

import HomeHeader from '@/components/HomeHeader'
import Button from '@/components/ui/Button'
import { Screen } from '@/components/ui/Screen'

export default function Index() {
  return (
    <Screen>
      <HomeHeader />
      <View style={{ paddingTop: 60 }}>
        <Button
          icon={Play}
          onPress={() => {}}
        >
          Watch Movie
        </Button>

        <Button
          variant='secondary'
          size='md'
          icon={Plus}
          onPress={() => {}}
        />

        {/*
        Header
          Left side: Logo (naming)
          Right side: Bell (notifications)

        Slider (continue "watching")
          Buttons: Read more, Plus (to add watchlist)

        Top picks for you (Carousel)

        Popular (Carousel)
      */}
      </View>
    </Screen>
  )
}
const styles = StyleSheet.create({})
