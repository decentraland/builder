import { env } from 'decentraland-commons'
import { BaseAPI } from 'decentraland-dapps/dist/lib/api'
import { Omit } from 'decentraland-dapps/dist/lib/types'
import { authorize } from './auth'
import { Rotation, Deployment } from 'modules/deployment/types'
import { Project, Manifest } from 'modules/project/types'
import { Asset, AssetAction, AssetParameter } from 'modules/asset/types'
import { Scene, SceneMetrics } from 'modules/scene/types'
import { FullAssetPack } from 'modules/assetPack/types'
import { createManifest } from 'modules/project/export'
import { dataURLToBlob, isDataUrl, objectURLToBlob } from 'modules/media/utils'
import { runMigrations } from 'modules/migrations/utils'
import { migrations } from 'modules/migrations/manifest'
import { PoolGroup } from 'modules/poolGroup/types'

export const BUILDER_SERVER_URL = env.get('REACT_APP_BUILDER_SERVER_URL', '')

export type RemoteProject = {
  id: string
  title: string
  description: string
  thumbnail: string
  is_public: boolean
  scene_id: string
  user_id: string | null
  rows: number
  cols: number
  created_at: string
  updated_at: string
}

export type RemotePoolGroup = {
  id: string,
  name: string,
  is_active: boolean,
  active_from: string,
  active_until: string
}

export type RemoteAssetPack = {
  id: string
  title: string
  url?: string
  thumbnail?: string
  user_id: string
  assets: RemoteAsset[]
  created_at?: string
  updated_at?: string
}

export type RemoteAsset = {
  id: string
  asset_pack_id: string
  name: string
  model: string
  script: string | null
  thumbnail: string
  tags: string[]
  category: string
  contents: Record<string, string>
  metrics: SceneMetrics
  parameters: AssetParameter[]
  actions: AssetAction[]
}

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
    user_id: project.userId,
    rows: project.layout.rows,
    cols: project.layout.cols,
    created_at: project.createdAt,
    updated_at: project.updatedAt
  }
}

function fromRemoteProject(remoteProject: RemoteProject): Project {
  return {
    id: remoteProject.id,
    title: remoteProject.title,
    description: remoteProject.description,
    thumbnail: `${BUILDER_SERVER_URL}/projects/${remoteProject.id}/media/thumbnail.png`,
    isPublic: !!remoteProject.is_public,
    sceneId: remoteProject.scene_id,
    userId: remoteProject.user_id,
    layout: {
      rows: remoteProject.rows,
      cols: remoteProject.cols
    },
    createdAt: remoteProject.created_at,
    updatedAt: remoteProject.updated_at
  }
}

function toRemoteAssetPack(assetPack: FullAssetPack): RemoteAssetPack {
  return {
    id: assetPack.id,
    title: assetPack.title,
    user_id: assetPack.userId || '',
    assets: assetPack.assets.map(asset => toRemoteAsset(asset))
  }
}

function fromRemoteAssetPack(remoteAssetPack: RemoteAssetPack): FullAssetPack {
  return {
    id: remoteAssetPack.id,
    title: remoteAssetPack.title,
    thumbnail: `${BUILDER_SERVER_URL}/storage/assetPacks/${remoteAssetPack.thumbnail!}`,
    userId: remoteAssetPack.user_id,
    assets: remoteAssetPack.assets.map(asset => fromRemoteAsset(asset)),
    createdAt: remoteAssetPack.created_at,
    updatedAt: remoteAssetPack.updated_at
  }
}

function toRemoteAsset(asset: Asset): RemoteAsset {
  return {
    id: asset.id,
    asset_pack_id: asset.assetPackId,
    name: asset.name,
    model: asset.model.replace(`${asset.assetPackId}/`, ''),
    script: asset.script,
    thumbnail: asset.thumbnail.replace(`${BUILDER_SERVER_URL}/storage/assets/`, ''),
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
    assetPackId: remoteAsset.asset_pack_id,
    name: remoteAsset.name,
    model: remoteAsset.model,
    script: remoteAsset.script,
    thumbnail: `${BUILDER_SERVER_URL}/storage/assets/${remoteAsset.thumbnail}`,
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

// Remote deployment

export type RemoteDeployment = {
  id: string
  last_published_cid: string | null
  is_dirty: boolean
  x: number
  y: number
  rotation: Rotation
  user_id: string | null
  created_at: string
  updated_at: string
}

export function toRemoteDeployment(deployment: Deployment): RemoteDeployment {
  return {
    id: deployment.id,
    last_published_cid: deployment.lastPublishedCID,
    is_dirty: deployment.isDirty,
    x: deployment.placement.point.x,
    y: deployment.placement.point.y,
    rotation: deployment.placement.rotation,
    user_id: deployment.userId,
    created_at: deployment.createdAt,
    updated_at: deployment.updatedAt
  }
}

export function fromRemoteDeployment(remoteDeployment: RemoteDeployment): Deployment {
  return {
    id: remoteDeployment.id,
    lastPublishedCID: remoteDeployment.last_published_cid,
    isDirty: remoteDeployment.is_dirty,
    placement: {
      point: {
        x: remoteDeployment.x,
        y: remoteDeployment.y
      },
      rotation: remoteDeployment.rotation
    },
    userId: remoteDeployment.user_id,
    createdAt: remoteDeployment.created_at,
    updatedAt: remoteDeployment.updated_at
  }
}

export type PoolDeploymentAdditionalFields = {
  groups?: string[]
}

export type Pagination = {
  limit?: number,
  offset?: number
}

export type PoolFilters = {
  group?: number,
  user_id?: number
}

// API

export class BuilderAPI extends BaseAPI {
  async deployToPool(projectId: string, additionalInfo: PoolDeploymentAdditionalFields | null = null) {
    await this.request('put', `/projects/${projectId}/pool`, additionalInfo, authorize())
    return
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

    await this.request('post', `/projects/${projectId}/media`, formData, {
      onUploadProgress,
      ...authorize()
    })
  }

  async fetchDeployments() {
    const remoteDeployments: RemoteDeployment[] = await this.request('get', `/deployments`, null, authorize())
    return remoteDeployments.map(fromRemoteDeployment)
  }

  async saveDeployment(deployment: Deployment) {
    await this.request('put', `/projects/${deployment.id}/deployment`, { deployment: toRemoteDeployment(deployment) }, authorize())
  }

  async deleteDeployment(id: string) {
    await this.request('delete', `/projects/${id}/deployment`, null, authorize())
    return
  }

  async fetchProjects() {
    const { items }: { items: RemoteProject[]; total: number } = await this.request('get', `/projects`, null, authorize())
    return items.map(fromRemoteProject)
  }

  async fetchPublicProject(projectId: string, type: 'public' | 'pool' = 'public') {
    const project: RemoteProject = await this.request('get', `/projects/${projectId}/${type}`)
    return fromRemoteProject(project)
  }

  async fetchPools(filters: PoolFilters & Pagination) {
    return this.request('get', '/pools', filters)
  }

  async fetchPoolGroups(activeOnly: boolean = false) {
    const items: RemotePoolGroup[] = await this.request('get', '/pools/groups', { activeOnly })
    return items.map(fromPoolGroup)
  }

  async saveProject(project: Project, scene: Scene) {
    const manifest = createManifest(toRemoteProject(project), scene)
    await this.request('put', `/projects/${project.id}/manifest`, { manifest }, authorize())
  }

  async saveProjectThumbnail(project: Project) {
    const blob = dataURLToBlob(project.thumbnail)
    const formData = new FormData()
    if (blob) {
      formData.append('thumbnail', blob)
      await this.request('post', `/projects/${project.id}/media`, formData, authorize())
    }
  }

  async deleteProject(id: string) {
    await this.request('delete', `/projects/${id}`, null, authorize())
    return
  }

  async fetchManifest(id: string, type: 'project' | 'public' | 'pool' = 'project') {
    const axiosRequestConfig = type === 'project' ? authorize() : {}
    const remoteManifest = await this.request('get', `/${type}s/${id}/manifest`, null, axiosRequestConfig)
    const manifest = {
      ...remoteManifest,
      project: fromRemoteProject(remoteManifest.project)
    } as Manifest

    return runMigrations(manifest, migrations)
  }

  async saveAssetPack(assetPack: FullAssetPack) {
    const remotePack = toRemoteAssetPack(assetPack)
    await this.request('put', `/assetPacks/${remotePack.id}`, { assetPack: remotePack }, authorize())
  }

  async saveAssetContents(
    asset: Asset,
    contents: Record<string, Blob>,
    onUploadProgress?: (progress: { loaded: number; total: number }) => void
  ) {
    const formData = new FormData()

    for (let path in contents) {
      formData.append(path, contents[path])
    }

    await this.request('post', `/assetPacks/${asset.assetPackId}/assets/${asset.id}/files`, formData, { onUploadProgress, ...authorize() })
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
      await this.request('post', `/assetPacks/${assetPack.id}/thumbnail`, formData, authorize())
    }
  }

  async fetchAssetPacks() {
    const remotePacks: RemoteAssetPack[] = await this.request('get', `/assetPacks`, null, authorize())
    return remotePacks.map(fromRemoteAssetPack)
  }

  async deleteAssetPack(assetPack: FullAssetPack) {
    await this.request('delete', `/assetPacks/${assetPack.id}`, null, authorize())
  }
}

export const builder = new BuilderAPI(BUILDER_SERVER_URL)
