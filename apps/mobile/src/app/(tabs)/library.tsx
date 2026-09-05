import { Link } from 'expo-router'
import { Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { MEDIA_TYPES } from '@app/types'

import { TYPE_LABELS } from '@app/constants'

export default function Library() {
  return (
    <SafeAreaView>
      <Text>Library</Text>

      {MEDIA_TYPES.map(type => (
        <Link
          key={type}
          href={`/title/${type}/1`}
        >
          {TYPE_LABELS[type]}
        </Link>
      ))}
    </SafeAreaView>
  )
}
