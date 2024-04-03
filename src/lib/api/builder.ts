import { AxiosRequestConfig, AxiosError } from 'axios'
import { Entity, Rarity } from '@dcl/schemas'
import { BaseAPI, APIParam, RetryParams } from 'decentraland-dapps/dist/lib/api'
import { Omit } from 'decentraland-dapps/dist/lib/types'
import { config } from 'config'
import { NO_CACHE_HEADERS } from 'lib/headers'
import { runMigrations } from 'modules/migrations/utils'
import { migrations } from 'modules/migrations/manifest'
import { Project, Manifest, TemplateStatus } from 'modules/project/types'
import { Asset, AssetAction, AssetParameter } from 'modules/asset/types'
import { Scene } from 'modules/scene/types'
import { FullAssetPack } from 'modules/assetPack/types'
import { dataURLToBlob, isDataUrl, objectURLToBlob } from 'modules/media/utils'
import { createManifest } from 'modules/project/export'
import { PoolGroup } from 'modules/poolGroup/types'
import { Pool } from 'modules/pool/types'
import { Item, ItemType, WearableData, BlockchainRarity, ItemApprovalData } from 'modules/item/types'
import { Account } from 'modules/committee/types'
import { retryParams } from 'modules/common/utils'
import { Collection, CollectionType } from 'modules/collection/types'
import { Cheque, ThirdParty } from 'modules/thirdParty/types'
import { PreviewType } from 'modules/editor/types'
import { ForumPost, ForumPostReply } from 'modules/forum/types'
import { ModelMetrics } from 'modules/models/types'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'
import { CurationSortOptions, CurationStatus } from 'modules/curations/types'
import { ItemCuration } from 'modules/curations/itemCuration/types'
import { isSmart } from 'modules/item/utils'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PaginatedResource } from './pagination'
import { Authorization } from './auth'

const PUBLIC_URL = process.env.VITE_BASE_URL
export const BUILDER_SERVER_URL = config.get('BUILDER_SERVER_URL', '')
export const FORUM_URL = config.get('FORUM_URL', '')

export const getContentsStorageUrl = (hash = '') => `${BUILDER_SERVER_URL}/storage/contents/${hash}`
export const getAssetPackStorageUrl = (hash = '') => `${BUILDER_SERVER_URL}/storage/assetPacks/${hash}`
export const getPreviewUrl = (projectId: string) => `${BUILDER_SERVER_URL}/projects/${projectId}/media/preview.png`
export const getEmptySceneUrl = () => `${PUBLIC_URL}/images/empty-ground.webp`

export type FetchCollectionsParams = {
  assignee?: string
  status?: CurationStatus
  type?: CollectionType
  synced?: boolean
  sort?: CurationSortOptions
  q?: string
  isPublished?: boolean
  tag?: string[]
  page?: number
  limit?: number
}

export type RemoteItem = {
  id: string // uuid
  name: string
  description: string
  thumbnail: string
  video: string | null
  eth_address: string
  collection_id: string | null
  blockchain_item_id: string | null
  price: string | null
  urn: string | null
  beneficiary: string | null
  rarity: Rarity | null
  total_supply: number | null
  is_published: boolean
  is_approved: boolean
  in_catalyst: boolean
  type: ItemType
  data: WearableData
  metrics: ModelMetrics
  contents: Record<string, string>
  content_hash: string | null
  created_at: Date
  updated_at: Date
  local_content_hash: string | null
  catalyst_content_hash: string | null
}

export type RemoteCollection = {
  id: string // uuid
  name: string
  eth_address: string
  salt: string | null
  contract_address: string | null
  urn: string
  is_published: boolean
  is_approved: boolean
  minters: string[]
  managers: string[]
  forum_link: string | null
  lock: Date | null
  reviewed_at: Date | null
  created_at: Date
  updated_at: Date
  item_count?: string
}

export type RemoteProject = {
  id: string
  title: string
  description: string
  thumbnail: string
  is_public: boolean
  scene_id: string
  eth_address: string
  rows: number
  cols: number
  created_at: string
  updated_at: string
  is_template: boolean
  video: string | null
  template_status: TemplateStatus | null
}

export type RemotePoolGroup = {
  id: string
  name: string
  is_active: boolean
  active_from: string
  active_until: string
}

export type RemotePool = RemoteProject & {
  groups: string[]
  parcels: number | null
  transforms: number | null
  gltf_shapes: number | null
  nft_shapes: number | null
  scripts: number | null
  entities: number | null
  likes: number
  like: boolean
}

export type RemoteAssetPack = {
  id: string
  title: string
  url?: string
  thumbnail?: string
  eth_address: string
  assets: RemoteAsset[]
  created_at?: string
  updated_at?: string
}

export type RemoteAsset = {
  id: string
  legacy_id: string | null
  asset_pack_id: string
  name: string
  model: string
  script: string | null
  thumbnail: string
  tags: string[]
  category: string
  contents: Record<string, string>
  metrics: ModelMetrics
  parameters: AssetParameter[]
  actions: AssetAction[]
}

export type RemoteWeeklyStats = {
  week: string
  title: string
  base: string
  users: number
  sessions: number
  median_session_time: number
  min_session_time: number
  average_session_time: number
  max_session_time: number
  direct_users: number
  direct_sessions: number
  max_concurrent_users: number
  max_concurrent_users_time: string
}

type BaseCuration = {
  id: string
  status: CollectionCuration['status']
  created_at: Date
  updated_at: Date
}

export type RemoteCollectionCuration = {
  collection_id: string
  assignee?: string
} & BaseCuration

export type RemoteItemCuration = {
  item_id: string
  content_hash: string
} & BaseCuration

/**
 * Transforms a Project into a RemoteProject for saving purposes only.
 * The `thumbnail` is omitted.
 */
function toRemoteProject(project: Project): Omit<RemoteProject, 'thumbnail'> {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    is_public: project.isPublic,
    scene_id: project.sceneId,
    eth_address: project.ethAddress!,
    rows: project.layout.rows,
    cols: project.layout.cols,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
    is_template: project.isTemplate,
    video: project.video,
    template_status: project.templateStatus
  }
}

function fromRemoteProject(remoteProject: RemoteProject): Project {
  return {
    id: remoteProject.id,
    title: remoteProject.title,
    description: remoteProject.description,
    thumbnail: remoteProject.is_template
      ? `${PUBLIC_URL}${remoteProject.thumbnail}`
      : `${BUILDER_SERVER_URL}/projects/${remoteProject.id}/media/thumbnail.png`,
    isPublic: !!remoteProject.is_public,
    sceneId: remoteProject.scene_id,
    ethAddress: remoteProject.eth_address,
    layout: {
      rows: remoteProject.rows,
      cols: remoteProject.cols
    },
    createdAt: remoteProject.created_at,
    updatedAt: remoteProject.updated_at,
    isTemplate: !!remoteProject.is_template,
    video: remoteProject.is_template && remoteProject?.video ? `${PUBLIC_URL}${remoteProject.video}` : null,
    templateStatus: remoteProject?.template_status
  }
}

function fromRemotePool(remotePool: RemotePool): Pool {
  const pool = fromRemoteProject(remotePool) as Pool

  pool.thumbnail = `${BUILDER_SERVER_URL}/projects/${remotePool.id}/media/preview.png`
  pool.isPublic = true
  pool.groups = remotePool.groups || []
  pool.likes = remotePool.likes || 0
  pool.like = !!remotePool.like

  if (remotePool.parcels) {
    pool.statistics = {
      parcels: remotePool.parcels,
      transforms: remotePool.transforms as number,
      gltf_shapes: remotePool.gltf_shapes as number,
      nft_shapes: remotePool.nft_shapes as number,
      scripts: remotePool.scripts as number,
      entities: remotePool.entities as number
    }
  }

  return pool
}

function toRemoteAssetPack(assetPack: FullAssetPack): RemoteAssetPack {
  return {
    id: assetPack.id,
    title: assetPack.title,
    eth_address: assetPack.ethAddress!,
    assets: assetPack.assets.map(asset => toRemoteAsset(asset))
  }
}

function fromRemoteAssetPack(remoteAssetPack: RemoteAssetPack): FullAssetPack {
  return {
    id: remoteAssetPack.id,
    title: remoteAssetPack.title,
    thumbnail: getAssetPackStorageUrl(remoteAssetPack.thumbnail),
    ethAddress: remoteAssetPack.eth_address,
    assets: remoteAssetPack.assets.map(asset => fromRemoteAsset(asset)),
    createdAt: remoteAssetPack.created_at,
    updatedAt: remoteAssetPack.updated_at
  }
}

function toRemoteAsset(asset: Asset): RemoteAsset {
  return {
    id: asset.id,
    legacy_id: asset.legacyId || null,
    asset_pack_id: asset.assetPackId,
    name: asset.name,
    model: asset.model.replace(`${asset.assetPackId}/`, ''),
    script: asset.script,
    thumbnail: asset.thumbnail.replace(getContentsStorageUrl(), ''),
    tags: asset.tags,
    category: asset.category,
    contents: asset.contents,
    metrics: asset.metrics,
    parameters: asset.parameters,
    actions: asset.actions
  }
}

function fromRemoteAsset(remoteAsset: RemoteAsset): Asset {
  return {
    id: remoteAsset.id,
    legacyId: remoteAsset.legacy_id,
    assetPackId: remoteAsset.asset_pack_id,
    name: remoteAsset.name,
    model: remoteAsset.model,
    script: remoteAsset.script,
    thumbnail: getContentsStorageUrl(remoteAsset.thumbnail),
    tags: remoteAsset.tags,
    category: remoteAsset.category,
    contents: remoteAsset.contents,
    metrics: remoteAsset.metrics,
    parameters: remoteAsset.parameters,
    actions: remoteAsset.actions
  }
}

function fromPoolGroup(poolGroup: RemotePoolGroup): PoolGroup {
  return {
    id: poolGroup.id,
    name: poolGroup.name,
    isActive: poolGroup.is_active,
    activeFrom: new Date(Date.parse(poolGroup.active_from)),
    activeUntil: new Date(Date.parse(poolGroup.active_until))
  }
}

function toRemoteItem(item: Item): Omit<RemoteItem, 'created_at' | 'updated_at'> {
  const remoteItem: Omit<RemoteItem, 'created_at' | 'updated_at'> = {
    id: item.id,
    name: item.name,
    description: item.description || '',
    thumbnail: item.thumbnail,
    video: item.video || null,
    eth_address: item.owner,
    collection_id: item.collectionId || null,
    blockchain_item_id: item.tokenId || null,
    price: item.price || null,
    urn: item.urn || null,
    beneficiary: item.beneficiary || null,
    rarity: item.rarity || null,
    total_supply: item.totalSupply === undefined ? null : item.totalSupply,
    is_published: false,
    is_approved: false,
    in_catalyst: item.inCatalyst || false,
    type: item.type,
    data: item.data,
    metrics: item.metrics,
    contents: item.contents,
    content_hash: item.blockchainContentHash,
    local_content_hash: item.currentContentHash,
    catalyst_content_hash: item.catalystContentHash
  }

  return remoteItem
}

function fromRemoteItem(remoteItem: RemoteItem) {
  const item: Item = {
    id: remoteItem.id,
    name: remoteItem.name,
    thumbnail: remoteItem.thumbnail,
    owner: remoteItem.eth_address,
    description: remoteItem.description,
    isPublished: remoteItem.is_published,
    isApproved: remoteItem.is_approved,
    inCatalyst: remoteItem.in_catalyst,
    type: remoteItem.type,
    data: remoteItem.data,
    contents: remoteItem.contents,
    currentContentHash: remoteItem.local_content_hash,
    blockchainContentHash: remoteItem.content_hash,
    catalystContentHash: remoteItem.catalyst_content_hash,
    metrics: remoteItem.metrics,
    createdAt: +new Date(remoteItem.created_at),
    updatedAt: +new Date(remoteItem.created_at)
  }

  if (remoteItem.collection_id) item.collectionId = remoteItem.collection_id
  if (remoteItem.blockchain_item_id) item.tokenId = remoteItem.blockchain_item_id
  if (remoteItem.price) item.price = remoteItem.price
  if (remoteItem.urn) item.urn = remoteItem.urn
  if (remoteItem.beneficiary) item.beneficiary = remoteItem.beneficiary
  if (remoteItem.rarity) item.rarity = remoteItem.rarity
  if (remoteItem.total_supply !== null) item.totalSupply = remoteItem.total_supply // 0 is false
  if (remoteItem.video) item.video = remoteItem.video
  if (remoteItem.type === ItemType.WEARABLE) item.data.isSmart = isSmart(remoteItem)

  return item
}

function toRemoteCollection(collection: Collection): Omit<RemoteCollection, 'created_at' | 'updated_at'> {
  const remoteCollection: Omit<RemoteCollection, 'created_at' | 'updated_at'> = {
    id: collection.id,
    name: collection.name,
    eth_address: collection.owner,
    salt: collection.salt || null,
    contract_address: collection.contractAddress || null,
    urn: collection.urn,
    is_published: false,
    is_approved: false,
    minters: collection.minters,
    managers: collection.managers,
    forum_link: collection.forumLink || null,
    lock: collection.lock ? new Date(collection.lock) : null,
    reviewed_at: collection.reviewedAt ? new Date(collection.reviewedAt) : null
  }

  return remoteCollection
}

function fromRemoteCollection(remoteCollection: RemoteCollection) {
  const collection: Collection = {
    id: remoteCollection.id,
    name: remoteCollection.name,
    owner: remoteCollection.eth_address,
    urn: remoteCollection.urn,
    isPublished: remoteCollection.is_published,
    isApproved: remoteCollection.is_approved,
    itemCount: Number(remoteCollection.item_count),
    minters: remoteCollection.minters || [],
    managers: remoteCollection.managers || [],
    forumLink: remoteCollection.forum_link || undefined,
    lock: remoteCollection.lock ? +new Date(remoteCollection.lock) : undefined,
    reviewedAt: remoteCollection.reviewed_at ? +new Date(remoteCollection.reviewed_at) : undefined,
    createdAt: +new Date(remoteCollection.created_at),
    updatedAt: +new Date(remoteCollection.updated_at)
  }

  if (remoteCollection.salt) collection.salt = remoteCollection.salt
  if (remoteCollection.contract_address) collection.contractAddress = remoteCollection.contract_address

  return collection
}

function getBaseCurationFields(remoteCuration: RemoteCollectionCuration | RemoteItemCuration) {
  return {
    id: remoteCuration.id,
    status: remoteCuration.status,
    createdAt: +new Date(remoteCuration.created_at),
    updatedAt: +new Date(remoteCuration.updated_at)
  }
}

function fromRemoteCollectionCuration(remoteCuration: RemoteCollectionCuration): CollectionCuration {
  return {
    ...getBaseCurationFields(remoteCuration),
    collectionId: remoteCuration.collection_id,
    assignee: remoteCuration.assignee
  }
}

function fromRemoteItemCuration(remoteCuration: RemoteItemCuration): ItemCuration {
  return {
    ...getBaseCurationFields(remoteCuration),
    itemId: remoteCuration.item_id,
    contentHash: remoteCuration.content_hash
  }
}

const toRemoteCollectionQueryParameters = (params?: FetchCollectionsParams) => {
  const queryParams = new URLSearchParams()

  if (params?.isPublished) {
    queryParams.append('is_published', `${params.isPublished.toString()}`)
  }

  if (params?.assignee) {
    queryParams.append('assignee', params.assignee)
  }

  if (params?.status) {
    queryParams.append('status', params.status)
  }

  if (params?.type) {
    queryParams.append('type', params.type)
  }

  if (params?.synced) {
    queryParams.append('synced', `${params.synced.toString()}`)
  }

  if (params?.sort) {
    queryParams.append('sort', params.sort)
  }

  if (params?.q) {
    queryParams.append('q', params.q)
  }

  if (params?.page) {
    queryParams.append('page', `${params.page}`)
  }

  if (params?.limit) {
    queryParams.append('limit', `${params.limit}`)
  }

  if (params?.tag && params.tag.length > 0) {
    for (const tag of params.tag) {
      queryParams.append('tag', tag)
    }
  }

  return queryParams
}

export type PoolDeploymentAdditionalFields = {
  groups?: string[]
}

export type Sort = {
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export type Pagination = {
  limit?: number
  offset?: number
}

export type PoolFilters = {
  group?: string
  eth_address?: string
}

// API

export class BuilderAPI extends BaseAPI {
  private authorization: Authorization

  constructor(url: string, authorization: Authorization) {
    super(url)
    this.authorization = authorization
  }

  async request(
    method: AxiosRequestConfig['method'],
    path: string,
    extraParams?: {
      params?: APIParam | null
      config?: AxiosRequestConfig
      retry?: RetryParams
    }
  ) {
    const { params, config, retry } = extraParams || {}
    let authConfig = {}
    let headers = {}
    if (config) {
      authConfig = { ...config }
      if (config.headers) {
        headers = { ...config.headers }
      }
    }
    const authHeaders = this.authorization.createAuthHeaders(method, path)
    headers = {
      ...headers,
      ...authHeaders
    }
    authConfig = { ...authConfig, headers }

    try {
      const response: any = await super.request(method, path, params, authConfig, retry)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response
    } catch (error) {
      if (this.isAxiosError(error) && error.response) {
        error.message = error.response.data.error
        error.code = error.response.status.toString()
      }
      throw error
    }
  }

  async deployToPool(projectId: string, additionalInfo: PoolDeploymentAdditionalFields | null = null) {
    await this.request('put', `/projects/${projectId}/pool`, { params: additionalInfo })
  }

  async uploadMedia(
    projectId: string,
    preview: Blob,
    shots: Record<string, Blob>,
    onUploadProgress?: (progress: { loaded: number; total: number }) => void
  ) {
    const formData = new FormData()
    formData.append('preview', preview)
    formData.append('north', shots.north)
    formData.append('east', shots.east)
    formData.append('south', shots.south)
    formData.append('west', shots.west)

    await this.request('post', `/projects/${projectId}/media`, {
      params: formData,
      config: {
        onUploadProgress
      }
    })
  }

  async uploadFile(file: Blob) {
    const formData = new FormData()
    formData.append('file', file)

    const { hash }: { hash: string } = await this.request('post', `/storage/upload`, {
      params: formData
    })
    return { hash }
  }

  async uploadCrdt(file: Blob, projectId: string): Promise<void> {
    const formData = new FormData()
    formData.append('file', file)
    await this.request('put', `/projects/${projectId}/crdt`, {
      params: formData
    })
    return
  }

  async fetchMain(projectId: string): Promise<Blob> {
    const request = async (path: string) => fetch(this.url + path, { headers: this.authorization.createAuthHeaders('get', path) })
    const about: { configurations: { scenesUrn: string[] } } = await request(`/projects/${projectId}/about`).then(resp => resp.json())
    const urn = about.configurations.scenesUrn[0]
    const hash = urn.split('urn:decentraland:entity:').pop()!.split('?')[0]
    const entity: Entity = await request(`/projects/${projectId}/contents/${hash}`).then(resp => resp.json())
    const main = entity.content.find(content => content.file === 'bin/index.js')!
    const file: string = await request(`/projects/${projectId}/contents/${main.hash}`).then(resp => resp.text())
    return new Blob([file])
  }

  async fetchCrdt(projectId: string): Promise<Blob> {
    const path = `/projects/${projectId}/crdt`
    const headers = this.authorization.createAuthHeaders('get', path)
    const response = await fetch(this.url + path, { headers })
    const blob = await response.blob()
    return blob
  }

  async fetchProjects() {
    const { items }: { items: RemoteProject[]; total: number } = await this.request('get', '/projects', { retry: retryParams })
    return items.map(fromRemoteProject)
  }

  async fetchPublicProject(projectId: string, type: 'public' | 'pool' = 'public') {
    const project: RemotePool = await this.request('get', `/projects/${projectId}/${type}`)
    return type === 'pool' ? fromRemotePool(project) : fromRemoteProject(project)
  }

  async fetchPoolsPage(filters: PoolFilters & Pagination & Sort) {
    const { items, total }: { items: RemotePool[]; total: number } = await this.request('get', '/pools', { params: filters })
    return { items: items.map(fromRemotePool), total }
  }

  async fetchPoolGroups(activeOnly = false) {
    const items: RemotePoolGroup[] = await this.request('get', '/pools/groups', { params: { activeOnly } })
    return items.map(fromPoolGroup)
  }

  // TODO: remove this after removing the SDK7_TEMPLATES feature flag
  async fetchTemplates() {
    const { items }: { items: RemoteProject[]; total: number } = await this.request('get', '/templates', {
      retry: retryParams,
      params: { sort_by: 'created_at', sort_order: 'asc' }
    })
    return items.map(fromRemoteProject).sort((template1, template2) => {
      if (template1.templateStatus === TemplateStatus.COMING_SOON) {
        return 1
      }

      if (template2.templateStatus === TemplateStatus.COMING_SOON) {
        return -1
      }
      return 0
    })
  }

  async saveProject(project: Project, scene: Scene) {
    const manifest = createManifest(toRemoteProject(project), scene)
    await this.request('put', `/projects/${project.id}/manifest`, { params: { manifest } })
  }

  async saveProjectThumbnail(project: Project) {
    const blob = dataURLToBlob(project.thumbnail)
    const formData = new FormData()
    if (blob) {
      formData.append('thumbnail', blob)
      await this.request('post', `/projects/${project.id}/media`, { params: formData })
    }
  }

  async deleteProject(id: string) {
    await this.request('delete', `/projects/${id}`)
  }

  async fetchManifest(id: string, type: PreviewType = PreviewType.PROJECT) {
    const remoteManifest = await this.request('get', `/${type}s/${id}/manifest`)
    const manifest = {
      ...remoteManifest,
      project: fromRemoteProject(remoteManifest.project)
    } as Manifest

    /* There are projects retrived from the cloud (S3, not DB) that don't have an ethAddress, even after migration (cos migration only impacts the DB),
       those projects can be loaded into the app state via the Scene Pool, and they end up with a null ethAddress, and are mixed with projects
       that the user created while being logged out (no ethAddress either). So to tell them appart we set them a placeholder value.
    */
    if (!manifest.project.ethAddress) {
      manifest.project.ethAddress = 'legacy'
    }

    return runMigrations(manifest, migrations)
  }

  async saveAssetPack(assetPack: FullAssetPack) {
    const remotePack = toRemoteAssetPack(assetPack)
    await this.request('put', `/assetPacks/${remotePack.id}`, { params: { assetPack: remotePack } })
  }

  async saveAssetContents(
    asset: Asset,
    contents: Record<string, Blob>,
    onUploadProgress?: (progress: { loaded: number; total: number }) => void
  ) {
    const formData = new FormData()

    for (const path in contents) {
      formData.append(path, contents[path])
    }

    await this.request('post', `/assetPacks/${asset.assetPackId}/assets/${asset.id}/files`, {
      params: formData,
      config: {
        onUploadProgress
      }
    })
  }

  async saveAssetPackThumbnail(assetPack: FullAssetPack) {
    let blob: Blob | null = null

    if (isDataUrl(assetPack.thumbnail)) {
      blob = dataURLToBlob(assetPack.thumbnail)
    } else {
      blob = await objectURLToBlob(assetPack.thumbnail)
    }

    if (!blob) throw new Error('Invalid thumbnail')

    const formData = new FormData()
    if (blob) {
      formData.append('thumbnail', blob)
      await this.request('post', `/assetPacks/${assetPack.id}/thumbnail`, { params: formData })
    }
  }

  async fetchAssetPacks(address?: string): Promise<FullAssetPack[]> {
    const promisesOfRemoteAssetPacks: Array<Promise<RemoteAssetPack[]>> = [
      this.request('get', '/assetPacks', { params: { owner: 'default' } })
    ]
    if (address) {
      promisesOfRemoteAssetPacks.push(this.request('get', '/assetPacks', { params: { owner: address } }))
    }

    const assetPacks: RemoteAssetPack[][] = await Promise.all(promisesOfRemoteAssetPacks)
    return assetPacks.reduce((acc, curr) => acc.concat(curr), []).map(fromRemoteAssetPack)
  }

  async deleteAssetPack(assetPack: FullAssetPack) {
    await this.request('delete', `/assetPacks/${assetPack.id}`)
  }

  likePool(pool: string, like = true) {
    const method = like ? 'put' : 'delete'
    return this.request(method, `/pools/${pool}/likes`)
  }

  async fetchItems(address?: string, params: { collectionId?: string; page?: number; limit?: number } = {}) {
    const { collectionId, page = DEFAULT_PAGE, limit = DEFAULT_PAGE_SIZE } = params
    const endpoint = address ? `/${address}/items` : '/items'
    const remoteItems: PaginatedResource<RemoteItem> = await this.request('get', endpoint, {
      params: { page, limit, collectionId },
      retry: retryParams
    })
    return { ...remoteItems, results: remoteItems.results.map(fromRemoteItem) }
  }

  async fetchItem(id: string) {
    const remoteItem: RemoteItem = await this.request('get', `/items/${id}`)
    return fromRemoteItem(remoteItem)
  }

  async fetchCollectionItems(collectionId: string, options: FetchCollectionsParams = {}) {
    const { page, limit } = options
    const remoteResponse = await this.request('get', `/collections/${collectionId}/items`, { params: options, retry: retryParams })
    if (page && limit && remoteResponse.results) {
      // TODO: remove this check when we have pagination on standard collections
      return { ...remoteResponse, results: remoteResponse.results.map(fromRemoteItem) } as PaginatedResource<Item>
    }
    return remoteResponse.map(fromRemoteItem) as Item[]
  }

  saveItem = async (item: Item, contents: Record<string, Blob>) => {
    await this.request('put', `/items/${item.id}`, { params: { item: toRemoteItem(item) } })
    // This has to be done after the PUT above, otherwise it will fail when creating an item, since it wont find it in the DB and return a 404
    await this.saveItemContents(item, contents)
  }

  saveItemContents = async (item: Item, contents: Record<string, Blob>) => {
    const requests = []

    if (Object.keys(contents).length > 0) {
      const formData = new FormData()
      const videosFormData = new FormData()

      for (const path in contents) {
        if (contents[path].type.startsWith('video/')) {
          videosFormData.append(path, contents[path])
        } else {
          formData.append(item.contents[path], contents[path])
        }
      }

      requests.push(this.request('post', `/items/${item.id}/files`, { params: formData }))

      if (Array.from(videosFormData.keys()).length > 0)
        requests.push(this.request('post', `/items/${item.id}/videos`, { params: videosFormData }))
    }

    return Promise.all(requests)
  }

  async deleteItem(id: string) {
    await this.request('delete', `/items/${id}`, {})
  }

  async fetchCollections(address?: string, params?: FetchCollectionsParams) {
    const url = address ? `/${address}/collections` : '/collections'
    const remoteCollections = await this.request('get', url, { params: toRemoteCollectionQueryParameters(params), retry: retryParams })

    const { limit, page } = params || {}
    if (page && limit && remoteCollections.results) {
      // TODO: remove this check when we have pagination on standard collections
      return { ...remoteCollections, results: remoteCollections.results.map(fromRemoteCollection) } as PaginatedResource<Item>
    }
    return remoteCollections.map(fromRemoteCollection) as Item[]
  }

  async fetchCollection(id: string) {
    const remoteCollection: RemoteCollection = await this.request('get', `/collections/${id}`, { retry: retryParams })
    return fromRemoteCollection(remoteCollection)
  }

  async publishStandardCollection(collectionId: string) {
    const { collection, items }: { collection: RemoteCollection; items: RemoteItem[] } = await this.request(
      'post',
      `/collections/${collectionId}/publish`
    )
    return {
      collection: fromRemoteCollection(collection),
      items: items.map(fromRemoteItem)
    }
  }

  async publishTPCollection(collectionId: string, itemIds: string[], cheque: Cheque) {
    const { collection, items, itemCurations }: { collection: RemoteCollection; items: RemoteItem[]; itemCurations: RemoteItemCuration[] } =
      await this.request('post', `/collections/${collectionId}/publish`, {
        params: {
          itemIds,
          cheque
        }
      })
    return {
      collection: fromRemoteCollection(collection),
      items: items.map(fromRemoteItem),
      itemCurations: itemCurations.map(fromRemoteItemCuration)
    }
  }

  async saveCollection(collection: Collection, data: string) {
    const remoteCollection = await this.request('put', `/collections/${collection.id}`, {
      params: {
        collection: toRemoteCollection(collection),
        data
      }
    })
    return fromRemoteCollection(remoteCollection)
  }

  saveTOS = async (collection: Collection, email: string): Promise<void> => {
    await this.request('post', `/collections/${collection.id}/tos`, { params: { email, collection_address: collection.contractAddress } })
  }

  lockCollection = async (collection: Collection): Promise<string> => {
    return this.request('post', `/collections/${collection.id}/lock`, { params: { collection_address: collection.id } }) as Promise<string>
  }

  async deleteCollection(id: string) {
    await this.request('delete', `/collections/${id}`, {})
  }

  async fetchCurations(): Promise<CollectionCuration[]> {
    const curations: RemoteCollectionCuration[] = await this.request('get', '/curations', { retry: retryParams })

    return curations.map(fromRemoteCollectionCuration)
  }

  async fetchItemCuration(itemId: Item['id']): Promise<ItemCuration> {
    const curation: RemoteItemCuration = await this.request('get', `/items/${itemId}/curation`)

    return fromRemoteItemCuration(curation)
  }

  async fetchItemCurations(collectionId: Collection['id'], itemIds?: Item['id'][]) {
    const curations: RemoteItemCuration[] = await this.request('get', `/collections/${collectionId}/itemCurations`, {
      params: {
        itemIds
      }
    })
    return curations.map(fromRemoteItemCuration)
  }

  async fetchCuration(collectionId: string): Promise<CollectionCuration | undefined> {
    const curation: RemoteCollectionCuration | undefined = await this.request('get', `/collections/${collectionId}/curation`)

    if (!curation) {
      return
    }

    return fromRemoteCollectionCuration(curation)
  }

  async pushCuration(collectionId: string, assignee?: string | null): Promise<void> {
    return this.request('post', `/collections/${collectionId}/curation`, { params: { curation: { assignee } } }) as Promise<void>
  }

  async pushItemCuration(itemId: string): Promise<ItemCuration> {
    const curation: RemoteItemCuration = await this.request('post', `/items/${itemId}/curation`)

    return fromRemoteItemCuration(curation)
  }

  async fetchCommittee(): Promise<Account[]> {
    return this.request('get', '/committee', { retry: retryParams }) as Promise<Account[]>
  }

  async createCollectionForumPost(collection: Collection, forumPost: ForumPost): Promise<string> {
    return this.request('post', `/collections/${collection.id}/post`, { params: { forumPost } }) as Promise<string>
  }

  /* Getting the forum post replies in the front to utilize the forum session
   * and get the latest read messages by the creator.
   */
  async getCollectionForumPostReply(topicId: string): Promise<ForumPostReply> {
    const response = await fetch(`${FORUM_URL}/t/${topicId}.json`)
    if (response.status === 200) {
      const data = await response.json()
      return {
        topic_id: data.id,
        highest_post_number: data.highest_post_number,
        show_read_indicator: data.show_read_indicator,
        last_read_post_number: data?.last_read_post_number
      }
    }

    throw new Error('The requested topic id could not be found.')
  }

  async createCollectionNewAssigneeForumPost(collection: Collection, forumPost: ForumPost): Promise<string> {
    return this.request('post', `/collections/${collection.id}/curation/post`, { params: { forumPost } }) as Promise<string>
  }

  async fetchRarities(): Promise<BlockchainRarity[]> {
    return this.request('get', '/rarities') as Promise<BlockchainRarity[]>
  }

  async fetchThirdParties(manager?: string): Promise<ThirdParty[]> {
    return this.request('get', '/thirdParties', { params: { manager }, retry: retryParams }) as Promise<ThirdParty[]>
  }

  async fetchThirdPartyAvailableSlots(thirdPartyId: string): Promise<number> {
    return this.request('get', `/thirdParties/${thirdPartyId}/slots`, { retry: retryParams }) as Promise<number>
  }

  fetchApprovalData = async (collectionId: string): Promise<ItemApprovalData> => {
    return this.request('get', `/collections/${collectionId}/approvalData`) as Promise<ItemApprovalData>
  }

  async updateCurationStatus(collectionId: string, status: CurationStatus) {
    return this.request('patch', `/collections/${collectionId}/curation`, { params: { curation: { status } } })
  }

  async updateCuration(collectionId: string, curation: Partial<Pick<CollectionCuration, 'assignee' | 'status'>>) {
    return this.request('patch', `/collections/${collectionId}/curation`, { params: { curation } })
  }

  async updateItemCurationStatus(itemId: string, status: CurationStatus): Promise<ItemCuration> {
    const curation: RemoteItemCuration = await this.request('patch', `/items/${itemId}/curation`, { params: { curation: { status } } })
    return fromRemoteItemCuration(curation)
  }

  async fetchContent(hash: string) {
    const url = getContentsStorageUrl(hash)
    const resp = await fetch(url, { headers: NO_CACHE_HEADERS })
    if (!resp.ok) {
      const message = await resp.text()
      throw new Error(message)
    }
    const blob = await resp.blob()
    return blob
  }

  async fetchContents(contents: Record<string, string>): Promise<Record<string, Blob>> {
    const blobs = new Map<string, Promise<Blob>>()
    const mappings: Promise<[string, Blob]>[] = []
    for (const path in contents) {
      const hash = contents[path]
      // avoid fetching the same hash more than once
      if (!blobs.has(hash)) {
        blobs.set(hash, this.fetchContent(hash))
      }
      const blob = blobs.get(hash)!
      mappings.push(blob.then(blob => [path, blob]))
    }
    return Promise.all(mappings).then(results =>
      results.reduce<Record<string, Blob>>((obj, [path, blob]) => {
        obj[path] = blob
        return obj
      }, {})
    )
  }

  isAxiosError(error: any): error is AxiosError {
    return error.isAxiosError as boolean
  }

  subscribeToNewsletter(email: string, source: string) {
    return this.request('post', `/newsletter`, { params: { email, source } })
  }
}
