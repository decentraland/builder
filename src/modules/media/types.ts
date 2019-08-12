export type Media = {
  preview: string
  north: string
  east: string
  south: string
  west: string
}

export type RawMedia = {
  preview: Blob | null
  north: Blob | null
  east: Blob | null
  south: Blob | null
  west: Blob | null
}
