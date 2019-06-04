import { env } from 'decentraland-commons'
import { Omit } from 'decentraland-dapps/dist/lib/types'
import { BaseAPI } from 'decentraland-dapps/dist/lib/api'
import { Project } from 'modules/project/types'
import { User } from 'modules/user/types'
import { Scene } from 'modules/scene/types'
import { AssetRegistryResponse, DARAssetsResponse } from 'modules/asset/types'

export const API_URL = env.get('REACT_APP_API_URL', '')
export const ASSETS_URL = env.get('REACT_APP_ASSETS_URL', '')
export const EMAIL_SERVER_URL = env.get('REACT_APP_EMAIL_SERVER_URL', '')
export const DAR_URL = env.get('REACT_APP_DAR_URL', '')
export const BUILDER_SERVER_URL = env.get('REACT_APP_BUILDER_SERVER_URL', '')

export enum EMAIL_INTEREST {
  MOBILE = 'builder-app-mobile',
  TUTORIAL = 'builder-app-tutorial',
  PUBLISH = 'builder-publish-preview', // TODO: deprecate this
  PUBLISH_POOL = 'builder-publish-pool',
  PUBLISH_DIRECT = 'builder-publish-direct'
}

export class API extends BaseAPI {
  async fetchAssetPacks() {
    const data = await this.request('get', `${ASSETS_URL}`, {})
    return data.packs
  }

  fetchAssetPack(id: string) {
    return this.request('get', `${ASSETS_URL}/${id}.json`, {})
  }

  async fetchCollectibleRegistries() {
    const req = await fetch(DAR_URL)
    if (!req.ok) return []
    const resp = (await req.json()) as AssetRegistryResponse
    return resp.registries || [] // TODO: remove the || [] when the DAR stops sending registries: null
  }

  async fetchCollectibleAssets(registry: string, ownerAddress: string) {
    const req = await fetch(`${DAR_URL}/${registry}/address/${ownerAddress}`)
    if (!req.ok) return []
    const resp = (await req.json()) as DARAssetsResponse
    return resp.assets || [] // TODO: remove the || [] when the DAR stops sending assets: null
  }

  reportEmail(email: string, interest: EMAIL_INTEREST) {
    return this.request('post', `${EMAIL_SERVER_URL}`, { email, interest })
  }

  async deployToPool(project: Omit<Project, 'thumbnail'>, scene: Scene, user: User) {
    return this.request('post', `${BUILDER_SERVER_URL}/project/`, { entry: JSON.stringify({ version: 1, project, scene, user }) })
  }

  async publishScenePreview(projectId: string, video: Blob, thumbnail: Blob, shots: Record<string, Blob>) {
    const formData = new FormData()
    formData.append('thumb', thumbnail)
    formData.append('north', shots.north)
    formData.append('east', shots.east)
    formData.append('south', shots.south)
    formData.append('west', shots.west)
    formData.append('video', video)

    return this.request('post', `${BUILDER_SERVER_URL}/project/${projectId}/preview`, formData)
  }
}

export const api = new API(API_URL)
