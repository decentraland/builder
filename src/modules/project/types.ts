import { Scene } from 'modules/scene/types'

export type Project = {
  id: string
  title: string
  description: string
  thumbnail: string
  sceneId: string
  userId: string | null
  rows: number
  cols: number
  createdAt: string
  updatedAt: string
}

export type ProjectLayout = { rows: number; cols: number; hasError: boolean }

export type Manifest = { version: number; project: Project; scene: Scene }
