import { StyleSheet, Text, View } from 'react-native'

import { colors, fontSize, fontWeight, space } from '@app/tokens'

interface Props {
  children: string
  action?: React.ReactNode
}

export default function ScreenTitle({ children, action }: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>{children}</Text>
      {action}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: space[4]
  },
  title: {
    color: colors.text.primary,
    fontSize: fontSize['2lg'],
    fontWeight: fontWeight.bold
  }
})
