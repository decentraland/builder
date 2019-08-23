import { env } from 'decentraland-commons'
import { BaseAPI } from 'decentraland-dapps/dist/lib/api'

export const MARKETPLACE_URL = env.get('REACT_APP_MARKETPLACE_URL', '')

export type Coord = {
  x: number
  y: number
}

export type Publication = {
  asset_id: string
  asset_type: string
  block_number: number
  block_time_created_at: number
  block_time_updated_at: number | null
  buyer: string | null
  contract_id: string
  created_at: string
  expires_at: number
  marketplace_address: string
  owner: string
  price: 100000
  status: 'open' | 'closed' | 'cancelled'
  tx_hash: string
  tx_status: 'confirmed' | 'reverted'
  updated_at: string
}

export type Parcel = {
  approvals_for_all: string[]
  auction_owner: string
  auction_price: number
  auction_timestamp: string
  data: {
    description: string
    ipns: string
    name: string
    version: number
  }
  district_id: null
  estate_id: null
  id: string
  last_transferred_at: string
  operator: null
  owner: string
  tags: {
    proximity: {
      district: {
        distance: number
        district_id: string
      }
      road: {
        distance: number
        district_id: string
      }
    }
  }
  publication: Publication | null
  update_managers: []
  update_operator: string
  x: number
  y: number
}

export type Estate = {
  approvals_for_all: string[]
  data: {
    ipns: string
    name: string
    parcels: Coord[]
    version: 0
    description: string
  }
  district_id: string | null
  id: string
  last_transferred_at: string
  operator: null
  owner: string
  publication: Publication | null
  token_id: string
  tx_hash: string
  update_managers: string[]
  update_operator: string
}

export class MarketplaceAPI extends BaseAPI {
  fetchAuthorizedParcels = (address: string): Promise<Parcel[]> => {
    return this.request('get', `/addresses/${address}/parcels`, {})
  }
  fetchAuthorizedEstates = (address: string): Promise<Estate[]> => {
    return this.request('get', `/addresses/${address}/estates`, {})
  }
}

export const marketplace = new MarketplaceAPI(MARKETPLACE_URL)
