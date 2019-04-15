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

export type SavedProject = { project: Project & { thumbnail?: string }; scene: Scene }
