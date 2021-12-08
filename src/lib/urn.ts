import { getURNProtocol, Network } from '@dcl/schemas'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'

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
type BaseAvatarURN = { type: URNType.BASE_AVATARS }
type CollectionsV2URN = { type: URNType.COLLECTIONS_V2 }
type CollectionThirdPartyURN = {
  type: URNType.COLLECTIONS_THIRDPARTY
  thirdPartyName: string
  thirdPartyCollectionId?: string
  thirdPartyTokenId?: string
}
export type DecodedURN<T extends URNType = any> = BaseDecodedURN &
  (T extends URNType.BASE_AVATARS
    ? BaseAvatarURN
    : T extends URNType.COLLECTIONS_V2
    ? CollectionsV2URN
    : T extends URNType.COLLECTIONS_THIRDPARTY
    ? CollectionThirdPartyURN
    : BaseAvatarURN | CollectionsV2URN | CollectionThirdPartyURN)

export function buildThirdPartyURN(thirdPartyName: string, collectionId: string, tokenId?: string) {
  let urn = `urn:decentraland:${getNetworkURNProtocol(Network.MATIC)}:collections-thirdparty:${thirdPartyName}:${collectionId}`
  if (tokenId) {
    urn += `:${tokenId}`
  }
  return urn
}

export function buildCatalystItemURN(contractAddress: string, tokenId: string): URN {
  return `urn:decentraland:${getNetworkURNProtocol(Network.MATIC)}:collections-v2:${contractAddress}:${tokenId}`
}

export function buildDefaultCatalystCollectionURN() {
  return `urn:decentraland:${getNetworkURNProtocol(Network.MATIC)}:collections-v2:0x0000000000000000000000000000000000000000`
}

export function extractThirdPartyId(urn: URN): string {
  const decodedURN = decodeURN(urn)
  if (decodedURN.type !== URNType.COLLECTIONS_THIRDPARTY) {
    throw new Error('URN is not a third party URN')
  }

  return `urn:decentraland:${decodedURN.protocol}:collections-thirdparty:${decodedURN.thirdPartyName}`
}

export function extractThirdPartyTokenId(urn: URN) {
  const decodedURN = decodeURN(urn)
  if (decodedURN.type !== URNType.COLLECTIONS_THIRDPARTY) {
    throw new Error(`Tried to build a third party token for a non third party URN "${urn}"`)
  }

  const { thirdPartyCollectionId, thirdPartyTokenId } = decodedURN
  return `${thirdPartyCollectionId}:${thirdPartyTokenId}`
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
