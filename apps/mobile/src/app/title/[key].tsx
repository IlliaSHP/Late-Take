import { router, useLocalSearchParams } from 'expo-router'
import { ChevronLeft, Plus } from 'lucide-react-native'
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from 'react-native'

import { useDiscoverFindByKey } from '@app/api'
import { colors, fontSize, fontWeight, space } from '@app/tokens'

import { HeroBackdrop } from '@/components/hero/HeroBackdrop'
import { TitleInfo } from '@/components/hero/TitleInfo'
import SectionCarousel from '@/components/section-carousel/SectionCarousel'
import TitleCard from '@/components/title-card/TitleCard'
import Button from '@/components/ui/Button'
import FloatingButton from '@/components/ui/FloatingButton'
import { Screen } from '@/components/ui/Screen'

export default function TitleDetail() {
  const { key } = useLocalSearchParams<{ key: string }>()
  const { width } = useWindowDimensions()
  const { data, isPending } = useDiscoverFindByKey(key)

  if (isPending || !data || data.status !== 200) return <Screen />

  const title = data.data

  const year = title.releaseDate
    ? new Date(title.releaseDate).getFullYear()
    : null
  /* .filter(Boolean) — прибирає falsy-значення.
  якщо year = null, масив буде [null, 'Drama', ...]. Boolean(null) дає false, тому null видаляється */
  const meta = [year, ...title.genres.slice(0, 3)].filter(Boolean).join(' · ')
  const cast = title.cast
    .slice(0, 3)
    .map(actor => actor.name)
    .join(', ')

  return (
    <Screen edges={[]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: space[10]}}
      >
        <HeroBackdrop
          coverUrl={title.coverUrl}
          height={width * 1.2}
        />

        <View style={styles.content}>
          <TitleInfo
            name={title.name}
            meta={meta}
            description={title.description}
            descriptionLines={4}
          />

          <Button
            icon={Plus}
            size='lg'
            onPress={() => {}}
          >
            Add to library
          </Button>

          {!!cast && (
            <Text style={styles.line}>
              <Text style={styles.label}>Cast: </Text>
              {cast}
            </Text>
          )}
        </View>

        {!!title.similar.length && (
          <SectionCarousel title='You may also like'>
            {title.similar.map(item => (
              <TitleCard
                key={item.key}
                title={item}
                onPress={() => router.push(`/title/${item.key}`)}
              />
            ))}
          </SectionCarousel>
        )}
      </ScrollView>

      <FloatingButton
        icon={ChevronLeft}
        side='left'
        iconOffset={-2}
        onPress={router.back}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: {
    marginTop: -space[20],
    paddingHorizontal: space['layout-horizontal'],
    gap: space[4]
  },
  line: {
    color: colors.text['little-muted'],
    fontSize: fontSize.sm
  },
  label: {
    color: colors.text.primary,
    fontWeight: fontWeight.medium
  }
})