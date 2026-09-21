import { Bell } from 'lucide-react-native'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'

import { colors, fontSize, fontWeight, space } from '@app/tokens'
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated'

export default function HomeHeader({scrollY}: {scrollY: SharedValue<number>}) {
  const insets = useSafeAreaInsets()

  const blurStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.get(), [0, 90], [0,1], 'clamp')
  }))

  // TODO: on Android, BlurView currently renders as a plain
  // semi-transparent block (fallback), not a real blur.
  // Enable via blurMethod='dimezisBlurViewSdk31Plus' + wrap the
  // scroll content in BlurTargetView, pass the ref via blurTarget.
  return (
    <View style={styles.root} pointerEvents='box-none'>
      <Animated.View
        pointerEvents='none'
        style={[StyleSheet.absoluteFill, blurStyle]}
      >
        <BlurView
          intensity={80}
          tint='systemChromeMaterialDark'
          style={[StyleSheet.absoluteFill]}
        />

        <View style={styles.overlay} />
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
    overflow: 'hidden'
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
    paddingBottom: space[4]
  },
  logo: {
    color: colors.text.primary,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    textShadowOffset: {height: 3, width: 2},
    textShadowRadius: 3,
    textShadowColor: 'rgba(0,0,0,0.25)'
  }
})
