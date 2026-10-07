import { StyleSheet, Text } from 'react-native'

import { colors, fontSize, fontWeight } from '@app/tokens'

interface ICreditLineProps {
  label: string
  names: string
}

export function CreditLine({ label, names }: ICreditLineProps) {
  return (
    <Text style={styles.line}>
      <Text style={styles.label}>{label}: </Text>
      {names}
    </Text>
  )
}

const styles = StyleSheet.create({
  line: {
    color: colors.text['little-muted'],
    fontSize: fontSize.sm
  },
  label: {
    color: colors.text.primary,
    fontWeight: fontWeight.medium
  }
})