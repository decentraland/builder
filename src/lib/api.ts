import { env } from 'decentraland-commons'
import { BaseAPI } from 'decentraland-dapps/dist/lib/api'

export const API_URL = env.get('REACT_APP_API_URL', '')
export const ASSETS_URL = env.get('REACT_APP_ASSETS_URL', '')
export const EMAIL_SERVER_URL = env.get('REACT_APP_EMAIL_SERVER_URL', '')
export const DAR_URL = env.get('REACT_APP_DAR_URL', '')

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
    return req.json()
  }

  async fetchCollectibleAssets(registry: string, ownerAddress: string) {
    const req = await fetch(`${DAR_URL}/${registry}/address/${ownerAddress}`)
    return req.json()
  }

  reportEmail(email: string, interest: EMAIL_INTEREST) {
    return this.request('post', `${EMAIL_SERVER_URL}`, { email, interest })
  }

  async deployToPool() {
    const req = await fetch(``)
    return req.json()
  }
}

export const api = new API(API_URL)
