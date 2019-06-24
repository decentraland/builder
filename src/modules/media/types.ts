export type Media = {
  thumbnail: string
  north: string
  east: string
  south: string
  west: string
}

export type RawMedia = {
  thumbnail: Blob | null
  north: Blob | null
  east: Blob | null
  south: Blob | null
  west: Blob | null
}
