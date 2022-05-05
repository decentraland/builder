export enum CurationStatus {
  UNDER_REVIEW = 'under_review',
  TO_REVIEW = 'to_review',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DISABLED = 'disabled'
}

export enum CurationSortOptions {
  MOST_RELEVANT = 'MOST_RELEVANT',
  NEWEST = 'NEWEST',
  NAME_DESC = 'NAME_DESC',
  NAME_ASC = 'NAME_ASC'
}

export type BaseCuration = {
  id: string
  status: CurationStatus
  createdAt: number
  updatedAt: number
}
