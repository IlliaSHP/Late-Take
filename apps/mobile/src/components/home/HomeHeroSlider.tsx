import { LinearGradient } from 'expo-linear-gradient'
import { Play, Plus } from 'lucide-react-native'
import { useState } from 'react'
import {
  StyleSheet,
  View,
  useWindowDimensions
} from 'react-native'

import { colors, fontSize, fontWeight, space } from '@app/tokens'

import type { DiscoverItemResponse } from '@app/api'

import { Button } from '../ui'
import PaginationDot from './PaginationDot'
import Animated, { FadeIn, FadeOut, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import HomeHeroSlide from './HomeHeroSlide'
import { TitleInfo } from '../hero/TitleInfo'
import { router } from 'expo-router'
import { HERO_GRADIENT } from '../hero/HeroBackdrop'

interface Props {
  items: DiscoverItemResponse[]
}

export default function HomeHeroSlider({ items }: Props) {
  const { width } = useWindowDimensions()
  const [index, setIndex] = useState(0)

  const height = width * 1.4
  const current = items[index]

  const scrollX = useSharedValue(0)

  const scrollHandler = useAnimatedScrollHandler(e => {
    scrollX.set(e.contentOffset.x)
  })

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(event.nativeEvent.contentOffset.x / width))
  }

  return (
    <View style={{ height: height}}>
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {items.map((item, i) => (
          <HomeHeroSlide
            key={item.key}
            item={item}
            index={i}
            width={width}
            height={height}
            scrollX={scrollX}
          />
        ))}
      </Animated.ScrollView>
      <LinearGradient
        colors={HERO_GRADIENT.colors}
        locations={HERO_GRADIENT.locations}
        style={StyleSheet.absoluteFill}
        pointerEvents='none'
      />

      <View style={styles.content} pointerEvents='box-none'>
        <Animated.View
          key={current?.key}
          entering={FadeIn.duration(400)}
          exiting={FadeOut.duration(200)}
          pointerEvents='none'
        >
          <TitleInfo
            name={current?.name || ''}
            meta={current?.genres?.slice(0, 3).join(' · ')}
            description='When an overachieving college senior makes a wrong turn, her road trip
            becomes a life-changing fight for...'
          />
          
        </Animated.View>
        <View style={styles.bottom} pointerEvents='box-none'>
          <View style={[styles.actionsDots, styles.actions]}>
            <Button
              icon={Play}
              onPress={() => {
                router.push(`/title/${current?.key}`)
              }}
            >
              Watch Movie
            </Button>
            <Button
              variant='secondary'
              icon={Plus}
              onPress={() => {}}
            />
          </View>
          <View style={[styles.actionsDots, styles.dots]}>
            {items.map((item, index) => (
              <PaginationDot
                key={item.key}
                index={index}
                width={width}
                scrollX={scrollX}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space['layout-horizontal'],
    paddingBottom: space[4],
    gap: space[2]
  },
  genres: {
    color: colors.text.primary,
    fontSize: fontSize.sm
  },
  name: {
    color: colors.text.primary,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold
  },
  description: {
    color: colors.text['little-muted'],
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: space[3]
  },
  actions: {gap: space[3] },
  dots: { gap: space[2] },
  actionsDots: {
    flexDirection: 'row',
    alignItems: 'center'
  }
})