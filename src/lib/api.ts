import { env } from 'decentraland-commons'
import { Omit } from 'decentraland-dapps/dist/lib/types'
import { BaseAPI } from 'decentraland-dapps/dist/lib/api'
import { Project } from 'modules/project/types'
import { User } from 'modules/user/types'
import { Scene } from 'modules/scene/types'
import { AssetRegistryResponse, DARAssetsResponse } from 'modules/asset/types'
import { ContentManifest, ContentUploadRequestMetadata, ContentServiceFile, Deployment } from 'modules/deployment/types'
import { createHeaders } from 'modules/auth/utils'

export const API_URL = env.get('REACT_APP_API_URL', '')
export const ASSETS_URL = env.get('REACT_APP_ASSETS_URL', '')
export const EMAIL_SERVER_URL = env.get('REACT_APP_EMAIL_SERVER_URL', '')
export const DAR_URL = env.get('REACT_APP_DAR_URL', '')
export const BUILDER_SERVER_URL = env.get('REACT_APP_BUILDER_SERVER_URL', '')
export const CONTENT_SERVER_URL = env.get('REACT_APP_CONTENT_SERVER_URL', '')
export const MARKETPLACE_URL = env.get('REACT_APP_MARKETPLACE_URL', '')
export const AVATARS_API_URL = env.get('REACT_APP_AVATARS_API_URL', '')

export enum EMAIL_INTEREST {
  MOBILE = 'builder-app-mobile',
  TUTORIAL = 'builder-app-tutorial',
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

  fetchAuthorizedParcels(address: string) {
    return this.request('get', `${MARKETPLACE_URL}/addresses/${address}/parcels`, {})
  }

  reportEmail(email: string, interest: EMAIL_INTEREST) {
    return this.request('post', `${EMAIL_SERVER_URL}`, { email, interest })
  }

  async deployToPool(project: Omit<Project, 'thumbnail'>, scene: Scene, user: User) {
    return this.request('post', `${BUILDER_SERVER_URL}/project/`, { entry: JSON.stringify({ version: 1, project, scene, user }) })
  }

  async publishScenePreview(
    projectId: string,
    thumbnail: Blob,
    shots: Record<string, Blob>,
    onUploadProgress?: (progress: { loaded: number; total: number }) => void
  ) {
    const formData = new FormData()
    formData.append('thumb', thumbnail)
    formData.append('north', shots.north)
    formData.append('east', shots.east)
    formData.append('south', shots.south)
    formData.append('west', shots.west)

    return this.request('post', `${BUILDER_SERVER_URL}/project/${projectId}/preview`, formData, {
      onUploadProgress
    })
  }

  async uploadToContentService(
    rootCID: string,
    manifest: ContentManifest,
    metadata: ContentUploadRequestMetadata,
    files: ContentServiceFile[],
    onUploadProgress?: (progress: { loaded: number; total: number }) => void
  ) {
    const data = new FormData()
    data.append('metadata', JSON.stringify(metadata))
    data.append(rootCID, JSON.stringify(Object.values(manifest)))

    for (let file of files) {
      const indentifier = manifest[file.path]
      let content = new Blob([file.content], {
        type: 'text/plain'
      })
      data.append(indentifier.cid, content, file.path)
    }

    try {
      await this.request('post', `${CONTENT_SERVER_URL}/mappings`, data, {
        onUploadProgress
      })
    } catch (e) {
      const { status } = e.response
      if (status === 401) {
        throw new Error('Your current address is not authorized to update the specified LAND')
      } else {
        throw new Error('Unable to update LAND')
      }
    }
  }

  async fetchContentServerValidation(x: number, y: number) {
    const req = await fetch(`${CONTENT_SERVER_URL}/validate?x=${x}&y=${y}`)
    const res = await req.json()
    return res
  }

  async fetchUser(accessToken: string) {
    const headers = createHeaders(accessToken)
    return this.request('get', `${AVATARS_API_URL}/profile`, null, { headers })
  }

  async fetchDeployments() {
    return Promise.resolve<Deployment[]>([])
  }

  async saveDeployment(deployment: Deployment) {
    console.log('Saving deployment', deployment)
    return Promise.resolve()
  }
}

export const api = new API(API_URL)
