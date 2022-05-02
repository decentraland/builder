import { BaseCuration } from '../types'

export type CollectionCuration = {
  collectionId: string
  assignee?: string | null
} & BaseCuration
