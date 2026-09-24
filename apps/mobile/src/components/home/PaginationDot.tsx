import { StyleSheet } from 'react-native'
import Animated, {
  Extrapolation,
  type SharedValue,
  interpolate,
  useAnimatedStyle
} from 'react-native-reanimated'

import { colors, radius } from '@app/tokens'
import { getPageInputRange } from '@/lib/animation'

interface PaginationDotProps {
  index: number
  width: number
  scrollX: SharedValue<number>
}

export default function PaginationDot({
  index,
  width,
  scrollX
}: PaginationDotProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = getPageInputRange(index, width)

    return {
      width: interpolate(
        scrollX.get(),
        inputRange,
        [6, 18, 6],
        Extrapolation.CLAMP
      ),

      opacity: interpolate(
        scrollX.get(),
        inputRange,
        [0.35, 1, 0.35],
        Extrapolation.CLAMP
      )
    }
  })

  return <Animated.View style={[styles.root, animatedStyle]} />
}

const styles = StyleSheet.create({
  root: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.primary
  }
})
