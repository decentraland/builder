import { Scene } from 'modules/scene/types'

export type Project = {
  id: string
  title: string
  description: string
  thumbnail: string
  isPublic: boolean
  sceneId: string
  userId: string | null
  createdAt: string
  updatedAt: string
  layout: Layout
}

export type Layout = {
  rows: number
  cols: number
}

export type ProjectLayout = Layout & { hasError: boolean }

export type Manifest<T = Project> = { version: number; project: T; scene: Scene }
