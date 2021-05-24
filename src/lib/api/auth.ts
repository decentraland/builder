import { Authenticator } from 'dcl-crypto'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { store } from 'modules/common/store'
import { RootState } from 'modules/common/types'
import { getData } from 'modules/identity/selectors'

const AUTH_CHAIN_HEADER_PREFIX = 'x-identity-auth-chain-'

export function createHeaders(idToken: string) {
  if (!idToken) return {}
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${idToken}`
  }
  return headers
}

export const authorize = (method: string = 'get', path: string = '') => {
  const headers: Record<string, string> = {}
  const state = store.getState() as RootState
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
