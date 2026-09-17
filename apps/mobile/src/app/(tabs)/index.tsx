import { Play, Plus } from 'lucide-react-native'
import { ScrollView, View } from 'react-native'

import type { TitleListItemResponse } from '@app/api'

import HomeHeader from '@/components/HomeHeader'
import TitleCard from '@/components/title-card/TitleCard'
import Button from '@/components/ui/Button'
import { Screen } from '@/components/ui/Screen'
import { space } from '@app/tokens'

export const SAMPLE_TITLES: TitleListItemResponse[] = [
  {
    id: 'clx1',
    type: 'MOVIE',
    name: 'Dune: Part Two',
    slug: 'dune-part-two',
    coverUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSn35r4NtzZbFMYAYE4hjmZaPV34wjT_49V8FM6oJaRMQ&s=10',
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
  return (
    <Screen>
      <HomeHeader />
      <View style={{ paddingTop: 60 }}>
        <Button
          icon={Play}
          onPress={() => {}}
        >
          Watch Movie
        </Button>

        <Button
          variant='secondary'
          size='md'
          icon={Plus}
          onPress={() => {}}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{
            marginTop: 15
          }}
          contentContainerStyle={[{ gap: space[3], paddingHorizontal: space[5]}]}
        >
          {SAMPLE_TITLES.map(title => (
            <TitleCard
              onPress={() => {}}
              title={title}
              key={title.id}
            />
          ))}
        </ScrollView>
        {/*
        Header
          Left side: Logo (naming)
          Right side: Bell (notifications)

        Slider (continue "watching")
          Buttons: Read more, Plus (to add watchlist)

        Top picks for you (Carousel)

        Popular (Carousel)
      */}
      </View>
    </Screen>
  )
}
