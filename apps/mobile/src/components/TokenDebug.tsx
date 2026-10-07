import * as SecureStore from 'expo-secure-store'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { colors, fontSize, radius, space } from '@app/tokens'

import { Button } from '@/components/ui/Button'

export function TokenDebug({ refetch }: {refetch?: () => void}) {
  const [access, setAccess] = useState<string | null>(null)
  const [refresh, setRefresh] = useState<string | null>(null)

  const read = async () => {
    setAccess(await SecureStore.getItemAsync('accessToken'))
    setRefresh(await SecureStore.getItemAsync('refreshToken'))
  }

  const breakToken = async () => {
    await SecureStore.setItemAsync('accessToken', 'broken')
    await read()
  }

  return (
    <View style={styles.root}>
      <Text style={styles.label}>access</Text>
      <Text style={styles.value}>{access ?? '—'}</Text>

      <Text style={styles.label}>refresh</Text>
      <Text style={styles.value}>{refresh ?? '—'}</Text>

      <Button
        variant='secondary'
        onPress={read}
      >
        Read tokens
      </Button>
      
      <Button
        variant='secondary'
        onPress={breakToken}
      >
        Break access token
      </Button>

      <Button
        variant='secondary'
        onPress={() => refetch?.()}
      >
        Send request
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    gap: space[2],
    padding: space[4],
    borderRadius: radius.md,
    backgroundColor: colors.bg.card
  },
  label: {
    color: colors.text.muted,
    fontSize: fontSize.xs
  },
  value: {
    color: colors.text.primary,
    fontSize: fontSize.xs
  }
})