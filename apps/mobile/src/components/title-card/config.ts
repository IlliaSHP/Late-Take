import type { TitleListItemResponseType } from '@app/api/src/generated/models'
import type { LucideIcon } from 'lucide-react-native'
import { BookOpen, Film, Gamepad2, Sparkles, Tv } from 'lucide-react-native'

import { radius } from '@app/tokens'

interface ICardConfig {
  width: number
  height: number
  radius: number
  icon: LucideIcon
  stacked?: boolean
  spine?: boolean
  glow?: string
}

export const CARD_CONFIG: Record<TitleListItemResponseType, ICardConfig> = {
  MOVIE: {
    width: 132,
    height: 198,
    radius: radius.md,
    icon: Film,
  },
  TV_SHOW: {
    width: 132,
    height: 198,
    radius: radius.md,
    icon: Tv,
    stacked: true,
  },
  ANIME: {
    width: 132,
    height: 198,
    radius: radius.md,
    icon: Sparkles,
    glow: 'rgba(129, 65, 248, 0.6)',
  },
  BOOK: {
    width: 124,
    height: 180,
    radius: radius.sm,
    icon: BookOpen,
    spine: true,
  },
  GAME: {
    width: 156,
    height: 208,
    radius: radius.lg,
    icon: Gamepad2,
  },
}