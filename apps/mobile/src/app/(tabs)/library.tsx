import { Link } from 'expo-router'
import { StyleSheet, Text } from 'react-native'

import { MEDIA_TYPES } from '@app/types'

import { TYPE_LABELS } from '@app/constants'

import { colors, fontSize, space } from '@app/tokens'

import { Screen } from '@/components/ui/Screen'
import ScreenTitle from '../../components/ui/ScreenTitle'

export default function Library() {
  return (
    <Screen>
      <ScreenTitle>Library</ScreenTitle>
      {MEDIA_TYPES.map(type => (
        <Link
          key={type}
          href={`/title/${type}/1`}
          style={styles.item}
        >
          {TYPE_LABELS[type]}
        </Link>
      ))}
    </Screen>
  )
}

const styles = StyleSheet.create({
  item: {
    color: colors.text.primary,
    fontSize: fontSize.base,
    paddingVertical: space[3]
  }
})
