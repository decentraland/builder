import { env } from 'decentraland-commons'
import { BaseAPI } from 'decentraland-dapps/dist/lib/api'
import { AssetRegistryResponse, DARAssetsResponse } from 'modules/asset/types'

export const DAR_URL = env.get('REACT_APP_DAR_URL', '')

export class DARAPI extends BaseAPI {
  fetchCollectibleRegistries = async () => {
    const req = await fetch(this.url)
    if (!req.ok) return []
    const resp = (await req.json()) as AssetRegistryResponse
    return resp.registries || [] // TODO: remove the || [] when the DAR stops sending registries: null
  }

  fetchCollectibleAssets = async (registry: string, ownerAddress: string) => {
    const req = await fetch(`${this.url}/${registry}/address/${ownerAddress}`)
    if (!req.ok) return []
    const resp = (await req.json()) as DARAssetsResponse
    return resp.assets || [] // TODO: remove the || [] when the DAR stops sending assets: null
  }
}

export const dar = new DARAPI(DAR_URL)
