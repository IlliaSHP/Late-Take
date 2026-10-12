import { StyleSheet, Text, View } from 'react-native'

import { useReviewFindByDiscoverKey } from '@app/api'
import { colors, fontSize, fontWeight, space } from '@app/tokens'

import { ReviewCard } from './ReviewCard'

interface Props {
  titleKey: string
}

export function ReviewsSection({ titleKey }: Props) {
  // отримуємо reviews через key конкретного тайтлу
  const { data } = useReviewFindByDiscoverKey(titleKey, { take: 3 })
  // Якщо статус 200 з беку, тоді правильні дані прийшли
  const reviews = data?.status === 200 ? data.data : null

  if (!reviews?.items.length) return null

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Reviews</Text>
        <Text style={styles.count}>{reviews.total}</Text>
      </View>

      {reviews.items.map(review => (
        <ReviewCard
          key={review.id}
          review={review}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { gap: space[4] },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space[2]
  },
  title: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold
  },
  count: {
    color: colors.text.muted,
    fontSize: fontSize.sm
  }
})