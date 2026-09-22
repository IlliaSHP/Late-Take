import { BlurView } from 'expo-blur'
import { Bell } from 'lucide-react-native'
import type { RefObject } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
  type SharedValue,
  interpolate,
  useAnimatedStyle
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { colors, fontSize, fontWeight, space } from '@app/tokens'
import { LinearGradient } from 'expo-linear-gradient'
import MaskedView from '@react-native-masked-view/masked-view'

interface Props {
  scrollY: SharedValue<number>
  blurTargetRef: RefObject<View | null>
}

export default function HomeHeader({ scrollY, blurTargetRef}:Props) {
  const insets = useSafeAreaInsets()

  const blurStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.get(), [0, 70], [0, 1], 'clamp')
  }))

  // "Platform.Version >= 31" -> Android 12+
  const hasRealBlur = Platform.OS === 'ios' || (Platform.OS === 'android' && Platform.Version >= 31)

  return (
    <View
      style={styles.root}
      pointerEvents='box-none'
    >
      <Animated.View
        pointerEvents='none'
        style={[StyleSheet.absoluteFill, blurStyle]}
      >
        {hasRealBlur ? (
          <MaskedView
            style={StyleSheet.absoluteFill}
            maskElement={
              <LinearGradient
                colors={['white', 'white', 'transparent']}
                locations={[0, 0.8, 1]}
                style={StyleSheet.absoluteFill}
              />
            }
          >
            <BlurView
              intensity={40}
              tint='systemChromeMaterialDark'
              style={[StyleSheet.absoluteFill]}
              blurTarget={blurTargetRef}
              blurMethod='dimezisBlurViewSdk31Plus'
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.65)', 'rgba(0,0,0,0.4)', 'transparent']}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFill}
            />
          </MaskedView>
        ) : (
          <View style={styles.overlay} />
        )}

      </Animated.View>
      <View style={[styles.inner, { paddingTop: insets.top }]}>
        <Text style={styles.logo}>Late Take</Text>

        <Pressable hitSlop={12}>
          <Bell color={colors.text.primary} />
        </Pressable>
      </View>
    </View>
  )
}
const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
    // minHeight: 80
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.45)'
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space['layout-horizontal'],
    paddingBottom: space[8]
  },
  logo: {
    color: colors.text.primary,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    textShadowOffset: { height: 3, width: 2 },
    textShadowRadius: 3,
    textShadowColor: 'rgba(0,0,0,0.25)'
  }
})
