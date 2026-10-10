import { router } from 'expo-router'
import { Star } from 'lucide-react-native'

import {
  ADD_TO_LIBRARY_ACTION,
  LIBRARY_STATUS_ACTIONS,
  REVIEW_RATING
} from '@app/constants'

import { Button } from '@/components/ui/Button'

import { useLibraryStatus } from '@/hooks/useLibraryStatus'

import { LIBRARY_ACTION_ICONS } from './library-status.data'

interface Props {
  titleKey: string
}

export function LibraryStatusButton({ titleKey }: Props) {
  const { isAuthorized, status, rating, setStatus } = useLibraryStatus(titleKey)

  const openReview = () => router.push(`/review/${titleKey}`)

  if (status === 'COMPLETED') {
    return (
      <Button
        variant='secondary'
        size='lg'
        icon={Star}
        onPress={openReview}
      >
        {rating ? `Rated ${rating}/${REVIEW_RATING.max}` : 'Rate'}
      </Button>
    )
  }

  const action = status ? LIBRARY_STATUS_ACTIONS[status] : ADD_TO_LIBRARY_ACTION

  const onPress = () => {
    if (!isAuthorized) {
      router.push('/login')
      return
    }

    setStatus(action.nextStatus)

    if (action.nextStatus === 'COMPLETED') openReview()
  }

  return (
    <Button
      size='lg'
      icon={LIBRARY_ACTION_ICONS[action.nextStatus]}
      onPress={onPress}
    >
      {action.label}
    </Button>
  )
}