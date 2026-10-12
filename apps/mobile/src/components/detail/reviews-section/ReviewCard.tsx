import { Star } from 'lucide-react-native'
import { StyleSheet, Text, View } from 'react-native'

import { REVIEW_RATING } from '@app/constants'

import { colors, fontSize, fontWeight, space } from '@app/tokens'

import { formatDate } from '@app/utils'

import type { ReviewResponse } from '@app/api'

interface Props {
  review: ReviewResponse
}

export function ReviewCard({ review }: Props) {
  const { rating, author, createdAt, text } = review

  return (
    <View style={styles.root}>
      <View style={styles.rating}>
        <Star
          size={16}
          color={colors.primary}
          fill={colors.primary}
        />
        <Text style={styles.ratingText}>
          {rating}/{REVIEW_RATING.max}
        </Text>
      </View>

      <View style={styles.meta}>
        <Text style={styles.author}>
          {author.displayName ?? author.username}
        </Text>
        <Text style={styles.date}>{formatDate(createdAt)}</Text>
      </View>

      <Text
        style={styles.text}
        numberOfLines={4}
      >
        {text}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { gap: space[2] },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1]
  },
  ratingText: {
    color: colors.text.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  author: {
    color: colors.text['little-muted'],
    fontSize: fontSize.sm
  },
  date: {
    color: colors.text.muted,
    fontSize: fontSize.sm
  },
  text: {
    color: colors.text.primary,
    fontSize: fontSize.sm
  }
})