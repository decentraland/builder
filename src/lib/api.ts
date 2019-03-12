import { env } from 'decentraland-commons'
import { BaseAPI } from 'decentraland-dapps/dist/lib/api'

const API_URL = env.get('REACT_APP_API_URL', '')
const ASSETS_URL = env.get('REACT_APP_ASSETS_URL', '')
const CONTEST_URL = env.get('REACT_APP_CONTEST_SERVER', '')

export class API extends BaseAPI {
  submitToContest(entry: any) {
    return this.request('post', `${CONTEST_URL}/entry`, { entry })
  }

  fetchAssetPack(id: string) {
    return this.request('get', `${ASSETS_URL}/${id}`, {})
  }
}

export const api = new API(API_URL)
