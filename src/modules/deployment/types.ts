export type ContentIdentifier = {
  cid: string
  name: string
}

export type ContentFile = {
  path: string
  content: Buffer
  size: number
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
