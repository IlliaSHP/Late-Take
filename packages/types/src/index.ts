export const MEDIA_TYPES = ['movie', 'series', 'game', 'book', 'anime'] as const
export type TMediaType = (typeof MEDIA_TYPES)[number]

export const STATUSES = ['want', 'progress', 'done'] as const
export type TStatus = (typeof STATUSES)[number]

export interface ITitle {
  id: string
  type: TMediaType
  name: string
  year: number | null
  cover: string | null
  status: TStatus
}

export * from './ui'
