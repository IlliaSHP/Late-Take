import { router, useLocalSearchParams } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

import FloatingButton from '@/components/ui/FloatingButton'
import { Screen } from '@/components/ui/Screen'

export default function TitleDetail() {
  const { id, type } = useLocalSearchParams<{ id: string; type: string }>()

  return (
    <Screen>
      <FloatingButton
        onPress={() => {}}
        side={'left'}
        icon={ChevronLeft}
        iconOffset={-2}
      />
      <View style={{ paddingTop: 60 }}>
        <Text>
          Title {type} {id}
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text>Back</Text>
        </Pressable>

        {/*
        Header
          Left side: Back button (arrow left)

        Backdrop Image
        Title

        Meta line
          RATING, age, year, duration, genre...

        Description + AI summary button (no spoilers)

        Primary button
          none     → [ + Add to library ]
          want     → [ Start ]
          progress → [ Mark as done ]
          done     → [ ✓ Done ] (not clickable)
          dropped  → [ Dropped ]

        LONG PRESS
          Opens full list of actions:
          want, progress, done, dropped

        Details
          Cast / Director / Author /
          Developer / Studio — depends on type

        Actions
          Add to Watchlist, add to collection, share...

        Similar titles (Carousel)

        Reviews (possible add review button)
      */}
      </View>
    </Screen>
  )
}
