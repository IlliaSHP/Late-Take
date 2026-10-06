import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { StyleSheet, View } from 'react-native'

import { colors } from '@app/tokens'

export const HERO_GRADIENT = {
  colors: ['rgba(2,0,3,0.7)', 'transparent', 'rgba(2,0,3,0.9)', colors.bg.base],
  locations: [0, 0.35, 0.75, 1]
} as const

interface Props {
  coverUrl: string | null
  height: number
}

export function HeroBackdrop({ coverUrl, height }: Props) {
  return (
    <View style={[styles.root, { height }]}>
      <Image
        source={coverUrl}
        style={StyleSheet.absoluteFill}
        contentFit='cover'
        contentPosition={{ top: '20%' }}
        transition={300}
      />

      <LinearGradient
        colors={HERO_GRADIENT.colors}
        locations={HERO_GRADIENT.locations}
        style={StyleSheet.absoluteFill}
        pointerEvents='none'
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    backgroundColor: colors.bg.card
  }
})