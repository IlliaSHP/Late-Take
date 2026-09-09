import { Download, Play, Plus } from 'lucide-react-native'
import { StyleSheet, Text, View } from 'react-native'

import { MEDIA_TYPES } from '@app/types'

import { TYPE_LABELS } from '@app/constants'

import Button from '@/components/Button'

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Late Take</Text>

      <Button
        icon={Play}
        size='lg'
        onPress={() => {}}
      >
        Watch Movie
      </Button>

      <Button
        icon={Download}
        onPress={() => {}}
        variant='secondary'
      >
        download
      </Button>

      <Button
        variant='secondary'
        size='md'
        icon={Plus}
        onPress={() => {}}
      />

      {MEDIA_TYPES.map(type => (
        <Text
          key={type}
          style={styles.item}
        >
          {TYPE_LABELS[type]}
        </Text>
      ))}
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  title: { color: '#fff', fontSize: 28, fontWeight: '600', marginBottom: 16 },
  item: { color: '#A1A1AA', fontSize: 16, paddingVertical: 4 }
})
