import { EntityType } from './contentUtils'

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

export type Deployment = {
  id: string
  lastPublishedCID: string | null
  isDirty: boolean
  placement: Placement
  ethAddress: string | null
  createdAt: string
  updatedAt: string
}

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

export type OccupiedAtlasParcel = Coordinate & {
  title: string
  projectId: string
}
