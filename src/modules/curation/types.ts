export enum CurationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export type Curation = {
  id: string
  collectionId: string
  status: CurationStatus
  created_at: number
  updated_at: number
}
