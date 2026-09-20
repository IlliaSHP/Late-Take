import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Play, Plus } from 'lucide-react-native'
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native'

import { colors, fontSize, fontWeight, space } from '@app/tokens'

import type { TitleListItemResponse } from '@app/api'

import Button from '../ui/Button'

interface Props {
  items: TitleListItemResponse[]
}

const { width } = Dimensions.get('window')
const HEIGHT = width * 1.25

export default function HomeHeroSlider({ items }: Props) {
  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      style={{ height: HEIGHT, flexShrink: 0 }}
    >
      {items.map(item => (
        <View
          key={item.id}
          style={styles.slide}
        >
          <Image
            source={item.coverUrl}
            style={StyleSheet.absoluteFill}
            contentFit='cover'
            transition={300}
          />
          <LinearGradient
            colors={['transparent', 'rgba(2,0,3,0.8)', colors.bg.base]}
            locations={[0.35, 0.75, 1]}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.content}>
            <Text
              style={styles.name}
              numberOfLines={2}
            >
              {item.name}
            </Text>

            <View style={styles.actions}>
              <Button
                icon={Play}
                onPress={() => {}}
              >
                Watch Movie
              </Button>
              <Button
                variant='secondary'
                icon={Plus}
                onPress={() => {}}
              />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  slide: {
    width,
    height: HEIGHT,
    justifyContent: 'flex-end'
  },
  content: { padding: 1, gap: space[4] },
  name: {
    color: colors.text.primary,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold
  },
  actions: { flexDirection: 'row', gap: space[3] }
})
