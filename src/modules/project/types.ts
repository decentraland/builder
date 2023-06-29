import { Scene } from 'modules/scene/types'

export type Project = {
  id: string
  title: string
  description: string
  thumbnail: string
  isPublic: boolean
  sceneId: string
  ethAddress: string | null
  createdAt: string
  updatedAt: string
  layout: Layout
  isTemplate: boolean
  video: string | null
  templateStatus: TemplateStatus | null
}

export type Layout = {
  rows: number
  cols: number
}

export type ProjectLayout = Layout & { hasError: boolean }

export type Manifest<T = Project> = { version: number; project: T; scene: Scene }

export enum TemplateStatus {
  ACTIVE = 'active',
  COMING_SOON = 'coming_soon'
}
