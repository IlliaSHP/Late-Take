import { type LucideIcon } from 'lucide-react-native'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { colors, fontSize, radius, space } from '@app/tokens'

interface Props {
  icon: LucideIcon
  label: string
  onPress: () => void
}

export function ActionButton({ icon: Icon, label, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    >
      <View style={styles.circle}>
        <Icon size={20} color={colors.text.primary} />
      </View>

      <Text style={styles.label}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    gap: space[2]
  },
  pressed: { opacity: 0.6 },
  circle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.bg.card
  },
  label: {
    color: colors.text['little-muted'],
    fontSize: fontSize.xs
  }
})