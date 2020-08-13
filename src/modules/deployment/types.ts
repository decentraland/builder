import { EntityType } from './contentUtils'
import { Project, Layout } from 'modules/project/types'

export type ContentIdentifier = {
  cid: string
  name: string
}

export type ContentServiceFile = {
  path: string
  content: Buffer
  size: number
}

export enum ProgressStage {
  NONE,
  UPLOAD_RECORDING, // Client images/video are uploaded to LAND pool
  CREATE_FILES, // Creates scene files
  UPLOAD_SCENE_ASSETS // Scene assets are uploaded to the content server (LAND deployment)
}

export type ContentManifest = Record<string, ContentIdentifier>

export type Coordinate = { x: number; y: number }

export type Rotation = 'north' | 'east' | 'south' | 'west'

export type Placement = { point: Coordinate; rotation: Rotation }

export enum DeploymentStatus {
  UNPUBLISHED,
  PUBLISHED,
  NEEDS_SYNC
}

export type ContentServiceScene = {
  id: string
  type: EntityType
  timestamp: number
  pointers: string[]
  content: string[]
  metadata: any
}[]

export type Deployment = {
  id: string
  projectId: string | null
  timestamp: number
  name: string
  thumbnail: string | null
  placement: Placement
  owner: string
  layout: Layout | null
  base: string
  parcels: string[]
}

export type SceneDefinition = {
  display?: {
    title: string
    favicon: string
    navmapThumbnail?: string
  }
  main: string
  owner: string
  scene: { parcels: string[]; base: string }
  source?: {
    version?: number
    origin: string
    projectId: string
    point?: Placement['point']
    rotation?: Placement['rotation']
    layout?: Project['layout']
    isEmpty?: boolean
  }
  communications?: any
  contact: {
    name: string
    email: string
  }
  policy?: any
  tags: string[]
}
