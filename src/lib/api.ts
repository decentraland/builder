import { env } from 'decentraland-commons'
import { BaseAPI } from 'decentraland-dapps/dist/lib/api'

const API_URL = env.get('REACT_APP_API_URL', '')
const ASSETS_URL = env.get('REACT_APP_ASSETS_URL', '')
const CONTEST_URL = env.get('REACT_APP_CONTEST_SERVER_URL', '')
const EMAIL_SERVER_URL = env.get('REACT_APP_EMAIL_SERVER_URL', '')

export enum EMAIL_INTEREST {
  MOBILE = 'builder-app-mobile',
  CONTEST = 'builder-app-submit',
  TUTORIAL = 'builder-app-tutorial',
  PUBLISH = 'builder-publish-preview'
}

export class API extends BaseAPI {
  submitToContest(entry: any) {
    return this.request('post', `${CONTEST_URL}/entry`, { entry })
  }

  async fetchAssetPacks() {
    const data = await this.request('get', `${ASSETS_URL}`, {})
    return data.packs
  }

  fetchAssetPack(id: string) {
    return this.request('get', `${ASSETS_URL}/${id}.json`, {})
  }

  reportEmail(email: string, interest: EMAIL_INTEREST) {
    return this.request('post', `${EMAIL_SERVER_URL}`, { email, interest })
  }
}

export const api = new API(API_URL)
