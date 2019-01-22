export type Project = BaseProject & {
  ownerEmail: string
  sceneId: string
  parcels: { x: number; y: number }[]
}

export type Template = BaseProject & {}

export type BaseProject = {
  id: string
  title: string
  description: string
  thumbnail: string
  parcels?: { x: number; y: number }[]
}
