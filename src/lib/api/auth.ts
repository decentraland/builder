import { Authenticator } from '@dcl/crypto'
import { localStorageGetIdentity } from '@dcl/single-sign-on-client'

const AUTH_CHAIN_HEADER_PREFIX = 'x-identity-auth-chain-'
const AUTH_CHAIN_TIMESTAMP_HEADER = 'x-identity-timestamp'
const AUTH_CHAIN_METADATA_HEADER = 'x-identity-metadata'

export class Authorization {
  constructor(private getAddress: () => string | undefined) {}

  createAuthHeaders(method = 'get', path = '', metadata?: Record<string, string>) {
    const headers: Record<string, string> = {}
    const address = this.getAddress()

    if (!address) {
      return headers
    }

    const identity = localStorageGetIdentity(address)

    if (identity) {
      // Matches the payload format of @dcl/crypto-middleware 6.x: the method and the
      // path are lowercased, but the metadata is signed verbatim so that its casing is
      // covered by the signature.
      let payload = (method + ':' + path).toLowerCase()
      const timestamp = Date.now()
      if (metadata) {
        payload = `${payload}:${timestamp}:${JSON.stringify(metadata)}`
      }
      const authChain = Authenticator.signPayload(identity, payload)

      for (let i = 0; i < authChain.length; i++) {
        headers[`${AUTH_CHAIN_HEADER_PREFIX}${i}`] = JSON.stringify(authChain[i])
      }
      metadata && (headers[AUTH_CHAIN_TIMESTAMP_HEADER] = timestamp.toString())
      metadata && (headers[AUTH_CHAIN_METADATA_HEADER] = JSON.stringify(metadata))
    }

    return headers
  }
}
