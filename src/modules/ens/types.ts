export type ENS = {
  address: string

  subdomain: string
  resolver: string
  content: string

  ipfsHash?: string

  // We'll need to change `landId` eventually so it can handle different content types. We could use:
  //   contentId?: string
  //   contentType?: ENSContent {LAND = 'land', (...)}
  landId?: string
}

export type ENSError = {
  message: string
  code?: number
  origin?: ENSOrigin
}

export enum ENSOrigin {
  RESOLVER = 'Resolver',
  CONTENT = 'Content'
}
