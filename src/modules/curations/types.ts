export enum CurationStatus {
  UNDER_REVIEW = 'under_review',
  TO_REVIEW = 'to_review',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DISABLED = 'disabled'
}

export type BaseCuration = {
  id: string
  status: CurationStatus
  createdAt: number
  updatedAt: number
}
