import { StyleSheet, Text, View } from 'react-native'

import { useReviewFindByDiscoverKey } from '@app/api'
import { colors, fontSize, fontWeight, space } from '@app/tokens'

import { ReviewCard } from './ReviewCard'

interface Props {
  titleKey: string
}

export function ReviewsSection({ titleKey }: Props) {
  // Завантажує з сервера список відгуків на конкретний тайтл:
  //  - titleKey — ключ тайтлу (наприклад, 'tmdb-movie-603'), для якого шукаємо відгуки
  //  - { take: 3 } — взяти тільки 3 відгуки (на детальній сторінці показуємо коротко)
  // Завантажений список запам'ятовується; після збереження відгуку useSaveReview
  // інвалідує його, і цей хук сам завантажує список заново
  const { data } = useReviewFindByDiscoverKey(titleKey, { take: 3 })
  // Якщо сервер відповів 200 — беремо дані відгуків: items (самі відгуки) і total (скільки їх усього)
  const reviews = data?.status === 200 ? data.data : null

  // Відгуків немає — секцію не показуємо
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