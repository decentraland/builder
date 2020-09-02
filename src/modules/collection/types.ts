export type Collection = {
  id: string // uuid
  name: string
  owner: string
  contractAddress?: string
  salt?: string
  isPublished: boolean
  createdAt: number
  updatedAt: number
}
