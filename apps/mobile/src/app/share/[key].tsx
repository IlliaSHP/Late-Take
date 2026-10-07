// Рядки 1–6 на скріншотах не видно, тому ці імпорти я відновив за використаним кодом
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { colors, fontSize, space } from '@app/tokens'

import { useDiscoverFindByKey } from '@app/api'

import { FriendAvatar } from '@/components/detail/share/FriendAvatar'
import { SHARE_FRIENDS } from '@/components/detail/share/share-friends.data'
import SectionCarousel from '@/components/section-carousel/SectionCarousel'
import { ScreenTitle, Button, Input } from '@/components/ui'

export default function ShareSheet() {
  const { key } = useLocalSearchParams<{ key: string }>()
  const { data } = useDiscoverFindByKey(key)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // TODO: Refactor
  const title = data?.status === 200 ? data.data : null
  const year = title?.releaseDate ? new Date(title.releaseDate).getFullYear() : null
  // .filter(Boolean) — прибирає undefined і null, щоб вони не потрапили в рядок.
  const heading = [title?.name, year].filter(Boolean).join(' ')

  const toggleFriend = (id: string) => {
    setSelectedIds(prevIds =>
      // якщо є - прибираємо, якщо нема - додаємо
      prevIds.includes(id) ? prevIds.filter(selectedId => selectedId !== id) : [...prevIds, id]
    )
  }

  const recipients = SHARE_FRIENDS.filter(friend => selectedIds.includes(friend.id))
    .map(friend => friend.name)
    .join(', ')

  return (
    <View style={styles.root}>
      <View style={styles.inset}>
        <ScreenTitle>Share with friends</ScreenTitle>
        <View style={styles.divider} />
      </View>

      <SectionCarousel title={heading}>
        {SHARE_FRIENDS.map(friend => (
          <FriendAvatar
            key={friend.id}
            name={friend.name}
            avatarUrl={friend.avatarUrl}
            isSelected={selectedIds.includes(friend.id)}
            onPress={() => toggleFriend(friend.id)}
          />
        ))}
      </SectionCarousel>

      <View style={[styles.inset, styles.form]}>
        <Text style={styles.to}>To: {recipients || 'Choose friends'}</Text>

        <Input
          placeholder='Check this out!'
          multiline
        />

        <View style={styles.divider} />

        <View style={styles.buttons}>
          <View style={styles.button}>
            <Button
              variant='secondary'
              onPress={router.back}
            >
              Cancel
            </Button>
          </View>

          <View style={styles.button}>
            <Button onPress={router.back}>Send</Button>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: space[6],
    paddingBottom: space[8]
  },
  inset: {
    paddingHorizontal: space['layout-horizontal']
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border
  },
  form: {
    gap: space[4]
  },
  to: {
    color: colors.text.muted,
    fontSize: fontSize.sm
  },
  buttons: {
    marginTop: 'auto',
    flexDirection: 'row',
    gap: space[3]
  },
  button: {
    flex: 1
  }
})
