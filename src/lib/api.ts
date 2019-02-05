import { env } from 'decentraland-commons'
import { BaseAPI } from 'decentraland-dapps/dist/lib/api'

const URL = env.get('REACT_APP_API_URL', '')

export class API extends BaseAPI {
  fetchAssetPack(id: string) {
    return this.request('get', `https://builder-pack.now.sh/${id}`, {})
  }
}

export const api = new API(URL)
