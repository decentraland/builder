import { Authenticator } from '@dcl/crypto'
import { localStorageGetIdentity } from '@dcl/single-sign-on-client'

const AUTH_CHAIN_HEADER_PREFIX = 'x-identity-auth-chain-'

export class Authorization {
  constructor(private getAddress: () => string | undefined) {}

  createAuthHeaders(method = 'get', path = '') {
    const headers: Record<string, string> = {}
    const address = this.getAddress()

    if (address) {
      const identity = localStorageGetIdentity(address)

      if (identity) {
        const endpoint = (method + ':' + path).toLowerCase()
        const authChain = Authenticator.signPayload(identity, endpoint)

        for (let i = 0; i < authChain.length; i++) {
          headers[`${AUTH_CHAIN_HEADER_PREFIX}${i}`] = JSON.stringify(authChain[i])
        }
      }
    }

    return headers
  }
}
