export type Curation = {
  id: string
  collectionId: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: number
  updated_at: number
}
