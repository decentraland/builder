import { BaseCuration } from '../types'

export type ItemCuration = {
  itemId: string
  contentHash: string
} & BaseCuration
