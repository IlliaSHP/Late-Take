import { colors, fontSize, space } from '@app/tokens'
import { ChevronRight } from 'lucide-react-native'
import type {LucideIcon} from 'lucide-react-native'
import { Pressable, StyleSheet, Text } from 'react-native'

interface Props {
  icon: LucideIcon
  label: string
  value?: string
  onPress?: () => void
  isLast?: boolean
}

export function ProfileMenuItem({
  icon: Icon,
  label,
  value,
  onPress,
  isLast
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      // Pressable calls this function on every render, passing the current press state
      style={({ pressed }) => [
        styles.root,
        !isLast && styles.border,
        pressed && styles.pressed
      ]}
    >
      <Icon
        size={22}
        color={colors.text.primary}
      />

      <Text style={styles.label}>{label}</Text>

      {!!value && <Text style={styles.value}>{value}</Text>}

      {!isLast && <ChevronRight
        size={20}
        color={colors.text.muted}
      />}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
    paddingVertical: space[5]
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  pressed: { opacity: 0.6 },
  label: {
    flex: 1,
    color: colors.text.primary,
    fontSize: fontSize.base
  },
  value: {
    color: colors.status.success,
    fontSize: fontSize.sm
  }
})
