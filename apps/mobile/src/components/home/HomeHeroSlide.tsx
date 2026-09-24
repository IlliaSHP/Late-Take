import { getPageInputRange } from "@/lib/animation"
import type { TitleListItemResponse } from "@app/api"
import { colors } from "@app/tokens"
import { Image } from "expo-image"
import { StyleSheet, View } from "react-native"
import Animated, { Extrapolation, interpolate, useAnimatedStyle, type SharedValue } from "react-native-reanimated"

interface Props {
  item: TitleListItemResponse
  index: number
  width: number
  height: number
  scrollX: SharedValue<number>
}

export default function HomeHeroSlide({ item, index, width, height, scrollX }: Props) {
  
  const imageStyle = useAnimatedStyle(() => {
    const inputRange = getPageInputRange(index, width)
    
    return {
      transform: [{
        translateX: interpolate(
          scrollX.get(),
          inputRange,
          [width * 0.13, 0, width * 0.13],
          Extrapolation.CLAMP
        )
      }]
    } 
  })

  return (
    <View style={[styles.root, { width, height }]}>
      <Animated.View style={[styles.imageContainer, imageStyle]}>
        <Image
          source={item.coverUrl}
          contentFit='cover'
          contentPosition={{ top: '10%' }}
          style={styles.image}
          transition={300}
        />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
    backgroundColor: colors.bg.card
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '-13%',
    right: '-13%',
  },
  image: {
    width: '100%',
    height: '100%'
  }
})