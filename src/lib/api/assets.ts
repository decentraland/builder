import { env } from 'decentraland-commons'
import { BaseAPI } from 'decentraland-dapps/dist/lib/api'
import { BaseAssetPack, FullAssetPack } from 'modules/assetPack/types'

export const ASSETS_URL = env.get('REACT_APP_ASSETS_URL', '')

export class AssetsAPI extends BaseAPI {
  fetchAssetPacks = async () => {
    const data = await this.request('get', `/`, {})
    return data.packs as BaseAssetPack[]
  }

  fetchAssetPack = async (id: string) => {
    const assetPack = await this.request('get', `/${id}.json`, {})
    return assetPack as FullAssetPack
  }
}

export const assets = new AssetsAPI(ASSETS_URL)
