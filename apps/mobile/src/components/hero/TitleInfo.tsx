import { StyleSheet, Text, View } from 'react-native'

import { colors, fontSize, fontWeight, space } from '@app/tokens'

interface Props {
  name: string
  meta?: string
  description?: string | null
  descriptionLines?: number
}

export function TitleInfo({
  name,
  meta,
  description,
  descriptionLines = 2
}: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.name} numberOfLines={2}>{name}</Text>

      {!!meta && <Text style={styles.meta}>{meta}</Text>}

      {!!description && (
        <Text style={styles.description} numberOfLines={descriptionLines}>
          {description}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { gap: space[2] },
  name: {
    color: colors.text.primary,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold
  },
  meta: {
    color: colors.text.primary,
    fontSize: fontSize.sm
  },
  description: {
    color: colors.text['little-muted'],
    fontSize: fontSize.sm,
    lineHeight: 20
  }
})
