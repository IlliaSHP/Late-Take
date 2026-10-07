import { router, useLocalSearchParams } from 'expo-router'
import { Bookmark, ChevronLeft, Plus, Share, Star } from 'lucide-react-native'
import {
  StyleSheet,
  View,
  useWindowDimensions
} from 'react-native'

import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated'

import { useDiscoverFindByKey } from '@app/api'
import { colors, space } from '@app/tokens'

import { CreditLine } from '@/components/detail/CreditLine'
import { HeroBackdrop } from '@/components/hero/HeroBackdrop'
import { TitleInfo } from '@/components/hero/TitleInfo'
import SectionCarousel from '@/components/section-carousel/SectionCarousel'
import TitleCard from '@/components/title-card/TitleCard'
import { ActionButton } from '@/components/ui/ActionButton'
import { Button } from '@/components/ui/Button'
import { FloatingButton } from '@/components/ui/FloatingButton'
import { Screen } from '@/components/ui/Screen'
import { CREATOR_ROLE_LABEL } from '@app/constants/src/role'
import { LinearGradient } from 'expo-linear-gradient'

const OVERLAP = space[20]

export default function TitleDetail() {
  const { key } = useLocalSearchParams<{ key: string }>()
  const { width } = useWindowDimensions()
  const { data, isPending } = useDiscoverFindByKey(key)

  const heroHeight = width * 1.2
  const scrollY = useSharedValue(0)

  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollY.set(event.contentOffset.y)
  })

  const heroStyle = useAnimatedStyle(() => {
    const y = scrollY.get()

    return {
      opacity: interpolate(y, [0, heroHeight], [1, 0.4], 'clamp'),
      transform: [
        {
          translateY: interpolate(
            y,
            [-heroHeight, 0, heroHeight],
            [heroHeight / 2, 0, -heroHeight * 0.3],
            'clamp'
          )
        },
        { scale: interpolate(y, [-heroHeight, 0], [2, 1], 'clamp') }
      ]
    }
  })

  if (isPending || !data || data.status !== 200) return <Screen />

  const title = data.data
  // TODO: move to custom hook or util fn
  const year = title.releaseDate
    ? new Date(title.releaseDate).getFullYear()
    : null
  /* .filter(Boolean) — прибирає falsy-значення.
  якщо year = null, масив буде [null, 'Drama', ...]. Boolean(null) дає false, тому null видаляється */
  const meta = [title.ageRating, year, ...title.genres.slice(0, 3)]
    .filter(Boolean)
    .join(' · ')

  /*
  означає: «візьми перший елемент масиву creators і поклади його в змінну firstCreator». Це те саме, що:
  const firstCreator = title.creators[0]
  */
  const [firstCreator] = title.creators
  const creators = title.creators
    .slice(0, 3)
    .map(({ name }) => name)
    .join(', ')
  const cast = title.cast
    .slice(0, 3)
    .map(({ name }) => name)
    .join(', ')

  return (
    <Screen edges={[]}>
      <FloatingButton
        // 1. Варіант з обгорткою: при натисканні React Native викликає стрілкову функцію,
        // а вона викликає router.back() без аргументів
        // onPress={() => {
        //   router.back()
        // }}
        //
        // 2. Передаємо посилання на функцію, а не викликаємо її (без дужок).
        // При натисканні React Native сам викличе onPress(event),
        // тобто router.back(event). Аргумент event router.back ігнорує,
        // тому результат той самий, що й у варіанті з обгорткою вище.
        onPress={router.back}
        icon={ChevronLeft}
        side='left'
        iconOffset={-2}
      />
      <Animated.View
        style={[styles.hero, heroStyle]}
        pointerEvents='none'
      >
        <HeroBackdrop
          coverUrl={title.coverUrl}
          height={heroHeight}
        />
      </Animated.View>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: heroHeight - OVERLAP }} />

        <View style={styles.body}>
          <LinearGradient
            colors={['transparent', colors.bg.base]}
            style={styles.bodyFade}
            pointerEvents='none'
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
              <CreditLine
                label='Cast'
                names={cast}
              />
            )}

          {!!firstCreator && (
            <CreditLine
              label={CREATOR_ROLE_LABEL[firstCreator.role]}
              names={creators}
            />
          )}
          </View>
        <View style={styles.actions}>
          <ActionButton
            icon={Bookmark}
            label='Watchlist'
            onPress={() => {}}
          />
          <ActionButton
            icon={Star}
            label='Rate'
            onPress={() => {}}
          />
          <ActionButton
            icon={Share}
            label='Share'
            onPress={() => {router.push(`/share/${title.key}`)}}
          />
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
        </View>
      </Animated.ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  hero: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0
  },
  body: {
    backgroundColor: colors.bg.base,
    paddingBottom: space[6]
  },
  bodyFade: {
    position: 'absolute',
    top: -space[10],
    left: 0,
    right: 0,
    height: space[10]
  },
  content: {
    paddingHorizontal: space['layout-horizontal'],
    gap: space[4]
  },
  actions: {
    flexDirection: 'row',
    marginTop: space[6]
  }
})
