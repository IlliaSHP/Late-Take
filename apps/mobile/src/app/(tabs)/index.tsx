import { BlurTargetView } from 'expo-blur'
import { useRef } from 'react'
import type { View } from 'react-native'
import { Platform } from 'react-native'
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue
} from 'react-native-reanimated'

import { space } from '@app/tokens'

import HomeHeader from '@/components/home/HomeHeader'
import HomeHeroSlider from '@/components/home/HomeHeroSlider'
import SectionCarousel from '@/components/section-carousel/SectionCarousel'
import TitleCard from '@/components/title-card/TitleCard'
import { Screen } from '@/components/ui/Screen'
import { useDiscoverGetTrending } from '@app/api/src/generated'
import { router } from 'expo-router'

export default function Index() {
  const blurTargetRef = useRef<View>(null)
  const scrollY = useSharedValue(0)
  const {data} = useDiscoverGetTrending({take: 20})

  /* UI thread */
  const scrollHandler = useAnimatedScrollHandler(e => {
    scrollY.set(e.contentOffset.y)
  })

  const items = data?.data ?? []
  const topPicksForYouItems = items.slice(5, 12)
  const heroItems = items.slice(0, 5)
  const trendingItems = items.slice(12, 20)

  return (
    <>
      <Screen edges={[]}>
        
        <BlurTargetView ref={blurTargetRef}>
          <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: Platform.OS === 'android' ? space[10] : space[24]
            }}
            onScroll={scrollHandler}
            scrollEventThrottle={16} /* 1000ms/16 === 60 per sec === 60fps */
          >
            {!!heroItems.length && <HomeHeroSlider items={heroItems} />}

            <SectionCarousel
              title='Top picks for you'
              onPressArrow={() => {}}
            >
              {topPicksForYouItems.map(title => (
                <TitleCard
                  onPress={() => {router.push(`/title/${title?.key}`)}}
                  title={title}
                  key={title.key}
                />
              ))}
            </SectionCarousel>
            <SectionCarousel
              title='Popular now'
              onPressArrow={() => {}}
            >
              {trendingItems.map(title => (
                <TitleCard
                  onPress={() => {router.push(`/title/${title?.key}`)}}
                  title={title}
                  key={title.key}
                />
              ))}
            </SectionCarousel>
          </Animated.ScrollView>
        </BlurTargetView>
        <HomeHeader
          scrollY={scrollY}
          blurTargetRef={blurTargetRef}
        />

      </Screen>
    </>
  )
}
