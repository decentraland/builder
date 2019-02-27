export type Project = {
  id: string
  title: string
  description: string
  thumbnail: string
  sceneId: string
  parcelLayout: { rows: number; cols: number }
  parcels?: { x: number; y: number }[] // Blockchain parcels
  ownerEmail?: string
  createdAt: number
}
