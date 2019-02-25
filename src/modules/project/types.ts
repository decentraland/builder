export type Project = {
  id: string
  title: string
  description: string
  thumbnail: string
  sceneId: string
  layout: Layout
  parcels?: { x: number; y: number }[] // Blockchain parcels
  ownerEmail?: string
  createdAt: number
}

export type Layout = { cols: number; rows: number }

export type ProjectLayout = Layout & { hasError: boolean }
