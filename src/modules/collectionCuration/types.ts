export enum CurationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export type BaseCuration = {
  id: string
  status: CurationStatus
  createdAt: number
  updatedAt: number
}

export type CollectionCuration = {
  collectionId: string
} & BaseCuration
