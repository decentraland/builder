export enum CurationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export type Curation = {
  id: string
  collectionId: string
  status: CurationStatus
  createdAt: number
  updatedAt: number
}
