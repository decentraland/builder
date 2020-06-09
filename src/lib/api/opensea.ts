import { env } from 'decentraland-commons'
import { BaseAPI } from 'decentraland-dapps/dist/lib/api'
import { OpenSeaResponse, OpenSeaAsset } from 'modules/asset/types'

export const OPENSEA_URL = env.get('REACT_APP_OPENSEA_URL', '')
export const OPENSEA_PAGE_SIZE = 20

export class OpenSeaAPI extends BaseAPI {
  fetchAssets = async (owner: string, page = 1) => {
    const limit = OPENSEA_PAGE_SIZE
    const offset = (page - 1) * OPENSEA_PAGE_SIZE
    const req = await fetch(this.url + `/assets?owner=${owner}&limit=${limit}&offset=${offset}`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
    })
    if (!req.ok) return []
    const resp = (await req.json()) as OpenSeaResponse
    const result = resp.assets || []
    if (result.length === OPENSEA_PAGE_SIZE) {
      const nextPage: OpenSeaAsset[] = await this.fetchAssets(owner, page + 1)
      return [...result, ...nextPage]
    }
    return result
  }
}

export const opensea = new OpenSeaAPI(OPENSEA_URL)
