import { Scene } from 'modules/scene/types'
import { Project } from 'modules/project/types'
import { PaginationOptions } from 'routing/utils'

export type Pool = Project & {
  groups: string[]
  statistics?: {
    parcels: number
    transforms: number
    gltf_shapes: number
    nft_shapes: number
    scripts: number
    entities: number
  }
  likes: number
  like: boolean
}

export type Manifest<T = Project> = { version: number; project: T; scene: Scene }

export type PoolsRequestFilters = PaginationOptions & {
  group?: string
  ethAddress?: string
}

export enum SortBy {
  NEWEST = 'updated_at',
  LIKES = 'likes',
  NAME = 'title',
  SIZE = 'parcels',
  ITEMS = 'transforms',
  SMART_ITEMS = 'scripts'
}

export const RECORDS_PER_PAGE = 24
