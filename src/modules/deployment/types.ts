import { Coordinate, Rotation } from 'modules/deployment/types'

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

export type ContentUploadRequestMetadata = {
  value: string
  signature: string
  pubKey: string
  validityType: number
  validity: Date
  sequence: number
  timestamp: number
  userId: string
}

export type Deployment = {
  remoteCID: string | null // CID as reported by the content server
  isDirty: boolean
  placement: Placement
}

export type Coordinate = { x: number; y: number }

export type Rotation = 'north' | 'east' | 'south' | 'west'

export type Placement = { point: Coordinate; rotation: Rotation }

export enum DeploymentStatus {
  UNPUBLISHED,
  PUBLISHED,
  NEEDS_SYNC
}
