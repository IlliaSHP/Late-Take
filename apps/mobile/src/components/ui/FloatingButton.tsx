import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect'
import type { LucideIcon } from 'lucide-react-native'
import { Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { colors, radius, space } from '@app/tokens'

interface Props {
  icon: LucideIcon
  onPress: () => void
  side: 'left' | 'right'
  iconOffset?: number
}

export default function FloatingButton({
  icon: Icon,
  onPress,
  side,
  iconOffset
}: Props) {
  const insets = useSafeAreaInsets()

  const position = [
    styles.root,
    { top: insets.top + space[2] },
    side === 'left' ? { left: space[4] } : { right: space[4] }
  ]

  const content = (
    <Icon
      size={26}
      color={colors.text.primary}
      style={iconOffset ? { marginLeft: iconOffset } : undefined}
    />
  )

  if (!isGlassEffectAPIAvailable()) {
    return (
      <View style={[position, styles.fallback]}>
        <Pressable
          onPress={onPress}
          // A Pressable's touch area cannot extend beyond its parent View's bounds.
          // Since the parent is 40×40, the maximum touch target is also 40×40.
          // https://reactnative.dev/docs/pressable
          // hitSlop={12}
        >
          {content}
        </Pressable>
      </View>
    )
  }

  return (
    <View style={position}>
      <GlassView
        style={styles.glass}
        glassEffectStyle={'clear'}
        isInteractive
      >
        <Pressable
          onPress={onPress}
          style={styles.press}
          hitSlop={12}
        >
          {content}
        </Pressable>
      </GlassView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    zIndex: 10,
    width: 40,
    height: 40,
    overflow: 'hidden',
    borderRadius: radius.full,
    // borderWidth: 2,
    // borderColor: 'red',
    // borderStyle: 'solid'
  },
  glass: {
    flex: 1,
    borderRadius: radius.full
  },
  press: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)'
  }
})
