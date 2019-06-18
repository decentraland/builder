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
  RECORD, // Client images/video are captured
  UPLOAD_RECORDING, // Client images/video are uploaded to LAND pool
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
