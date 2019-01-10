export interface Project {
  id: string
  title: string
  description: string
  ownerEmail: string
  parcels: { x: number; y: number }[]
  sceneId: string
}
