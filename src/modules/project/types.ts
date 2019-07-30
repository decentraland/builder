import { Scene } from 'modules/scene/types'

export type Project = {
  id: string
  title: string
  description: string
  thumbnail: string
  sceneId: string
  rows: number
  cols: number
  ownerEmail?: string
  createdAt: number
}

export type ProjectLayout = { rows: number; cols: number; hasError: boolean }

export type SaveFile = { version: number; project: Project & { thumbnail?: string }; scene: Scene }
