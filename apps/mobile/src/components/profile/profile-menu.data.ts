import { router } from 'expo-router'
import { Bell, CreditCard, Heart, Users } from 'lucide-react-native'

export const PROFILE_MENU = [
  {
    icon: CreditCard,
    label: 'Subscription',
    value: 'Free',
    onPress: () => router.push('/subscription')
  },
  {
    icon: Heart,
    label: 'Watchlist',
    onPress: () => router.push('/library')
  },
  {
    icon: Users,
    label: 'Friends',
    onPress: () => {}
  },
  {
    icon: Bell,
    label: 'Notifications',
    onPress: () => {}
  }
]