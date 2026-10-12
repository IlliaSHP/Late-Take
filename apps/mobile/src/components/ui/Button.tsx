import type { LucideIcon } from 'lucide-react-native'
import { Pressable, StyleSheet, Text, type TextStyle, type ViewStyle } from 'react-native'

import type { TButtonSize, TButtonVariant } from '@app/types'

import { colors, fontSize, fontWeight, radius, space } from '@app/tokens'

interface Props {
  children?: React.ReactNode
  variant?: TButtonVariant
  size?: TButtonSize
  icon?: LucideIcon
  isDisabled?: boolean
  onPress?: () => void
}

const CONTENT_COLOR: Record<TButtonVariant, string> = {
  primary: colors.text.secondary,
  secondary: colors.text.primary
}

const ICON_SIZE: Record<TButtonSize, number> = {
  md: 18,
  lg: 20
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  isDisabled,
  onPress
}: Props) {
  const isIconOnly = !children && !!Icon
  const contentColor = CONTENT_COLOR[variant]

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.root,
        variantStyles[variant],
        sizeStyles[size],
        isIconOnly && [styles.iconOnly, iconOnlySizes[size]],
        pressed && styles.pressed,
        isDisabled && styles.disabled
      ]}
    >
      {Icon && (
        <Icon
          size={ICON_SIZE[size]}
          color={contentColor}
        />
      )}
      {children && (
        <Text style={[styles.label, labelSizes[size], { color: contentColor }]}>
          {children}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
    borderRadius: radius.full
  },
  iconOnly: {
    paddingHorizontal: 0,
    aspectRatio: 1
  },
  pressed: {
    opacity: 0.7
  },
  disabled: {
    opacity: 0.4
  },
  label: {
    fontWeight: fontWeight.semibold
  }
})

// Мапи стилів за variant / size. До них звертаються за динамічним ключем
// (variantStyles[variant], sizeStyles[size]), тому це звичайні об'єкти, а не StyleSheet.create:
// правило react-native/no-unused-styles бачить лише явні звернення (styles.root)
// і позначало б усі ключі цих мап як невикористані.
//
// satisfies Record<K, ViewStyle> перевіряє об'єкт на відповідність типу:
// є стиль для кожного ключа K (кожного variant / size), немає зайвих ключів,
// і кожне значення — коректний стиль (ViewStyle для View/Pressable, TextStyle для Text).
//
// Різниця з анотацією типу (const sizeStyles: Record<TButtonSize, ViewStyle> = {...}):
// - з анотацією тип змінної стає рівно Record<...>, і точний вміст об'єкта TS не пам'ятає:
//   sizeStyles.md.height має тип DimensionValue | undefined (як властивість height у ViewStyle);
// - з satisfies TS лише перевіряє об'єкт, а тип змінної виводить із самого об'єкта:
//   sizeStyles.md.height має тип number, бо там лежить 44.
// Точний тип потрібен, якщо значення з мапи використовуються не лише в style (наприклад, в обчисленнях).
const variantStyles = {
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.bg.card }
} satisfies Record<TButtonVariant, ViewStyle>

const sizeStyles = {
  md: { height: 44, paddingHorizontal: space[5] },
  lg: { height: 56, paddingHorizontal: space[6] }
} satisfies Record<TButtonSize, ViewStyle>

const iconOnlySizes = {
  md: { width: 44 },
  lg: { width: 56 }
} satisfies Record<TButtonSize, ViewStyle>

const labelSizes = {
  md: { fontSize: fontSize.sm },
  lg: { fontSize: fontSize.base }
} satisfies Record<TButtonSize, TextStyle>