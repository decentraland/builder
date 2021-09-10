import { Authenticator } from 'dcl-crypto'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { getData } from 'modules/identity/selectors'

const AUTH_CHAIN_HEADER_PREFIX = 'x-identity-auth-chain-'

// TODO type this
export class Authorization {
  private store: any

  constructor(store: any) {
    this.store = store
  }

  createAuthHeaders(method: string = 'get', path: string = '') {
    const headers: Record<string, string> = {}
    const state = this.store.getState() as RootState
    const address = getAddress(state)
    if (address) {
      const identities = getData(state)
      const identity = identities[address]
      if (identity) {
        const endpoint = (method + ':' + path).toLowerCase()
        const authChain = Authenticator.signPayload(identity, endpoint)
        for (let i = 0; i < authChain.length; i++) {
          headers[AUTH_CHAIN_HEADER_PREFIX + i] = JSON.stringify(authChain[i])
        }
      }
    }
    return headers
  }
}
