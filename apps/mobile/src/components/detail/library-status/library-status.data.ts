import { type LucideIcon, Check, Play, Plus } from 'lucide-react-native'

import type { TNextLibraryStatus } from '@app/types'

// Статичні дані для LibraryStatusButton винесені в окремий .data.ts,
// щоб файл компонента містив лише розмітку й логіку кнопки.
export const LIBRARY_ACTION_ICONS: Record<TNextLibraryStatus, LucideIcon> = {
  PLANNED: Plus,
  IN_PROGRESS: Play,
  COMPLETED: Check
}