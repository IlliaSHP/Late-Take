import { BlurTargetView } from 'expo-blur'
import { useEffect, useRef } from 'react'
import type { View } from 'react-native'
import { Platform } from 'react-native'
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue
} from 'react-native-reanimated'

import { space } from '@app/tokens'

import type { TitleListItemResponse } from '@app/api'

import HomeHeader from '@/components/home/HomeHeader'
import HomeHeroSlider from '@/components/home/HomeHeroSlider'
import SectionCarousel from '@/components/section-carousel/SectionCarousel'
import TitleCard from '@/components/title-card/TitleCard'
import { Screen } from '@/components/ui/Screen'

export const SAMPLE_TITLES: TitleListItemResponse[] = [
  {
    id: 'clx1',
    type: 'MOVIE',
    name: 'Dune: Part Two',
    slug: 'dune-part-two',
    coverUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSn35r4NtzZbFMYAYE4hjmZaPV34wjT_49V8FM6oJaRMQ&s=10',
    releaseDate: '2024-03-01T00:00:00.000Z',
    rating: 8.4,
    ratingCount: 1200
  },
  {
    id: 'clx2',
    type: 'TV_SHOW',
    name: 'Severance',
    slug: 'severance',
    coverUrl:
      'https://www.cinematerial.com/p/500x/1k35swfb/severance-movie-poster.jpg',
    releaseDate: '2022-02-18T00:00:00.000Z',
    rating: 8.7,
    ratingCount: 2100
  },
  {
    id: 'clx3',
    type: 'ANIME',
    name: "Frieren: Beyond Journey's End",
    slug: 'frieren',
    coverUrl:
      'https://m.media-amazon.com/images/I/71SZgjz10wL._AC_UF1000,1000_QL80_.jpg',
    releaseDate: '2023-09-29T00:00:00.000Z',
    rating: 9.3,
    ratingCount: 1800
  },
  {
    id: 'clx4',
    type: 'BOOK',
    name: 'Project Hail Mary',
    slug: 'project-hail-mary',
    coverUrl:
      'https://m.media-amazon.com/images/I/81WXoyRUc+L._AC_UF1000,1000_QL80_.jpg',
    releaseDate: '2021-05-04T00:00:00.000Z',
    rating: 8.9,
    ratingCount: 760
  },
  {
    id: 'clx5',
    type: 'GAME',
    name: "Baldur's Gate 3",
    slug: 'baldurs-gate-3',
    coverUrl: 'https://m.media-amazon.com/images/I/71T9Nc8x-3L.jpg',
    releaseDate: '2023-08-03T00:00:00.000Z',
    rating: 9.6,
    ratingCount: 8900
  }
]

export default function Index() {
  useEffect(() => {}, [])
  const blurTargetRef = useRef<View>(null)

  const scrollY = useSharedValue(0)

  /* UI thread */
  const scrollHandler = useAnimatedScrollHandler(e => {
    scrollY.set(e.contentOffset.y)
  })

  return (
    <>
      <Screen edges={[]}>
        
        <BlurTargetView ref={blurTargetRef}>
          <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: Platform.OS === 'android' ? space[10] : space[20]
            }}
            onScroll={scrollHandler}
            scrollEventThrottle={16} /* 1000ms/16 === 60 per sec === 60fps */
          >
            <HomeHeroSlider items={SAMPLE_TITLES} />

            <SectionCarousel
              title='Top picks for you'
              onPressArrow={() => {}}
            >
              {SAMPLE_TITLES.map(title => (
                <TitleCard
                  onPress={() => {}}
                  title={title}
                  key={title.id}
                />
              ))}
            </SectionCarousel>
            <SectionCarousel
              title='Popular now'
              onPressArrow={() => {}}
            >
              {SAMPLE_TITLES.map(title => (
                <TitleCard
                  onPress={() => {}}
                  title={title}
                  key={title.id}
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
      {/*

      Slider (continue "watching")
        Buttons: Read more, Plus (to add watchlist)

    */}
    </>
  )
}
