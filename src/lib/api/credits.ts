import { BaseAPI } from 'decentraland-dapps/dist/lib/api'
import { config } from 'config'
import { Authorization } from './auth'

export const CREDITS_SERVER_URL = config.get('CREDITS_SERVER_URL', '')

// The credits-server returns the USD (shop) credits balance already computed.
// `credits` is the pre-computed amount of shop credits and `balanceCents` the
// underlying balance in USD cents (1 credit = 10 cents).
export type ShopCreditsBalance = {
  balanceCents: number
  credits: number
}

export type UserCreditsResponse = {
  usd?: ShopCreditsBalance
}

const EMPTY_SHOP_CREDITS_BALANCE: ShopCreditsBalance = { balanceCents: 0, credits: 0 }

export class CreditsAPI extends BaseAPI {
  private authorization?: Authorization

  constructor(authorization?: Authorization) {
    super(CREDITS_SERVER_URL)
    if (authorization) {
      this.authorization = authorization
    }
  }

  // GET /users/:address/credits — signed request (ADR-44). The requester must be
  // the same address in the path. Returns the shop (USD) credits balance,
  // defaulting to zero when unavailable.
  public fetchShopCreditsBalance = async (address: string): Promise<ShopCreditsBalance> => {
    const path = `/users/${address}/credits`
    const headers = this.authorization ? this.authorization.createAuthHeaders('get', path, {}) : {}
    const result = await fetch(this.url + path, { headers })

    if (!result.ok) {
      return EMPTY_SHOP_CREDITS_BALANCE
    }

    const json: UserCreditsResponse = await result.json()
    return json.usd ?? EMPTY_SHOP_CREDITS_BALANCE
  }
}
