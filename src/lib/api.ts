import { env } from 'decentraland-commons'
import { BaseAPI } from 'decentraland-dapps/dist/lib/api'

export const API_URL = env.get('REACT_APP_API_URL', '')
export const ASSETS_URL = env.get('REACT_APP_ASSETS_URL', '')
export const CONTEST_URL = env.get('REACT_APP_CONTEST_SERVER_URL', '')
export const EMAIL_SERVER_URL = env.get('REACT_APP_EMAIL_SERVER_URL', '')

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

  async fetchCollectibles(ownerAddress: string, contractAddress: string) {
    const req = await fetch(
      `https://api.opensea.io/api/v1/assets/?owner=${ownerAddress}&asset_contract_address=${contractAddress}&force_update=true`
    )
    const json = await req.json()
    return json
  }

  async refreshCollectible(contractAddress: string, tokenId: string) {
    const req = await fetch(`https://api.opensea.io/asset/${contractAddress}/${tokenId}/?force_update=true`)
    const json = await req.json()
    return json
  }

  reportEmail(email: string, interest: EMAIL_INTEREST) {
    return this.request('post', `${EMAIL_SERVER_URL}`, { email, interest })
  }
}

export const api = new API(API_URL)
