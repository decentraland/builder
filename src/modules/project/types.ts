import { Scene } from 'modules/scene/types'

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

export type Layout = { rows: number; cols: number }

export type ProjectLayout = Layout & { hasError: boolean }

export type SaveFile = { version: number; project: Project & { thumbnail?: string }; scene: Scene }

export type Coordinate = { x: number; y: number }

export type Rotation = 'north' | 'east' | 'south' | 'west'

export type Placement = { point: Coordinate; rotation: Rotation }
