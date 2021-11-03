import { getURNProtocol, Network } from '@dcl/schemas'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'

const VERSION = 1

/**
 * urn:decentraland:
 *   (?<protocol>
 *     mainnet|
 *     ropsten|
 *     matic|
 *     mumbai|
 *     off-chain
 *   ):
 *   (
 *     (?<type>
 *       base-avatars|
 *       collections-v2|
 *       collections-thirdparty
 *     ):
 *     (?<suffix>
 *       ((?<=base-avatars:)BaseMale|BaseFemale)|
 *       ((?<=collections-v2)0x[a-fA-F0-9]{40})|
 *       ((?<=collections-thirdparty:)
 *          (?<thirdPartyName>[^:|\\s]+)
 *          (:(?<thirdPartyCollectionId>[^:|\\s]+))?
 *          (:(?<thirdPartyTokenId>[^:|\\s]+))?
 *       )
 *     )
 *   )
 */
const baseMatcher = 'urn:decentraland'
const protocolMatcher = '(?<protocol>mainnet|ropsten|matic|mumbai|off-chain)'
const typeMatcher = '(?<type>base-avatars|collections-v2|collections-thirdparty)'

const baseAvatarsSuffixMatcher = '((?<=base-avatars:)BaseMale|BaseFemale)'
const collectionsSuffixMatcher = '((?<=collections-v2:)0x[a-fA-F0-9]{40})'
const thirdPartySuffixMatcher =
  '((?<=collections-thirdparty:)(?<thirdPartyName>[^:|\\s]+)(:(?<thirdPartyCollectionId>[^:|\\s]+))?(:(?<thirdPartyTokenId>[^:|\\s]+))?)'

const urnRegExp = new RegExp(
  `${baseMatcher}:${protocolMatcher}:${typeMatcher}:(?<suffix>${baseAvatarsSuffixMatcher}|${collectionsSuffixMatcher}|${thirdPartySuffixMatcher})`
)

export enum URNProtocol {
  MAINNET = 'mainnet',
  ROPSTEN = 'ropsten',
  MATIC = 'matic',
  MUMBAI = 'mumbai',
  OFF_CHAIN = 'off-chain'
}
export enum URNType {
  BASE_AVATARS = 'base-avatars',
  COLLECTIONS_V2 = 'collections-v2',
  COLLECTIONS_THIRDPARTY = 'collections-thirdparty'
}
export type URN = string

type BaseDecodedURN = {
  protocol: URNProtocol
  suffix: string
}
export type DecodedURN = BaseDecodedURN &
  (
    | { type: URNType.BASE_AVATARS | URNType.COLLECTIONS_V2 }
    | {
        type: URNType.COLLECTIONS_THIRDPARTY
        thirdPartyName: string
        thirdPartyCollectionId: string
        thirdPartyTokenId: string
      }
  )

export function buildItemURN(type: string, name: string, description: string, category: string, bodyShapeTypes: string): URN {
  return `${VERSION}:${type[0]}:${name}:${description}:${category}:${bodyShapeTypes}`
}

export function buildThirdPartyURN(thirdPartyName: string, collectionId: string, tokenId?: string) {
  let urn = `urn:decentraland:${getNetworkURNProtocol(Network.MATIC)}:collections-thirdparty:${thirdPartyName}:${collectionId}`
  if (tokenId) {
    urn += `:${tokenId}`
  }
  return urn
}

export function getCatalystItemURN(contractAddress: string, tokenId: string): URN {
  return `urn:decentraland:${getNetworkURNProtocol(Network.MATIC)}:collections-v2:${contractAddress}:${tokenId}`
}

export function toLegacyURN(urn: URN): URN {
  return urn.replace('urn:decentraland:off-chain:base-avatars:', 'dcl://base-avatars/')
}

export function decodeURN(urn: URN): DecodedURN {
  const matches = urnRegExp.exec(urn)

  if (!matches || !matches.groups) {
    throw new Error(`Invalid URN: "${urn}"`)
  }

  return matches.groups as DecodedURN
}

function getNetworkURNProtocol(network: Network) {
  return getURNProtocol(getChainIdByNetwork(network))
}
