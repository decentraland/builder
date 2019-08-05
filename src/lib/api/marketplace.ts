import { env } from 'decentraland-commons'
import { BaseAPI } from 'decentraland-dapps/dist/lib/api'

export const MARKETPLACE_URL = env.get('REACT_APP_MARKETPLACE_URL', '')

export class MarketplaceAPI extends BaseAPI {
  fetchAuthorizedParcels = (address: string) => {
    return this.request('get', `/addresses/${address}/parcels`, {})
  }
}

export const marketplace = new MarketplaceAPI(MARKETPLACE_URL)
