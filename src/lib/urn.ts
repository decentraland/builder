import { getURNProtocol, Network } from '@dcl/schemas'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'

/**
 * urn:decentraland:
 *   (
 *     (?<protocol>
 *       mainnet|
 *       goerli|
 *       sepolia|
 *       matic|
 *       mumbai|
 *       amoy|
 *       off-chain
 *     ):
 *   )?
 *   (
 *     (?<type>
 *       base-avatars|
 *       collections-v2|
 *       collections-thirdparty|
 *       entity
 *     ):
 *     (?<suffix>
 *       ((?<=base-avatars:)BaseMale|BaseFemale)|
 *       ((?<=collections-v2)0x[a-fA-F0-9]{40})|
 *       ((?<=collections-thirdparty:)
 *          (?<thirdPartyName>[^:|\\s]+)
 *          (:(?<thirdPartyCollectionId>[^:|\\s]+))?
 *          (:(?<thirdPartyTokenId>[^:|\\s]+))?
 *       )
 *       ((?<=entity:)(?<entityId>[^:|\\s]+)?\\?=\\&baseUrl=(?<baseUrl>https:[^=\\s]+)?)
 *     )
 *   )
 */
const baseMatcher = 'urn:decentraland'
const protocolMatcher = '(?<protocol>mainnet|goerli|sepolia|matic|mumbai|amoy|off-chain)'
const typeMatcher = '(?<type>base-avatars|collections-v2|collections-thirdparty|entity)'

const baseAvatarsSuffixMatcher = '((?<=base-avatars:)BaseMale|BaseFemale)'
const collectionsSuffixMatcher = '((?<=collections-v2:)(?<collectionAddress>0x[a-fA-F0-9]{40}))(:(?<tokenId>[^:|\\s]+))?'
const thirdPartySuffixMatcher =
  '((?<=collections-thirdparty:)(?<thirdPartyName>[^:|\\s]+)(:(?<thirdPartyCollectionId>[^:|\\s]+))?(:(?<thirdPartyTokenId>[^:|\\s]+))?)'
const entitySuffixMatcher = '((?<=entity:)(?<entityId>[^\\?|\\s]+)(\\?=\\&baseUrl=(?<baseUrl>[^\\?|\\s]+))?)'

export enum URNProtocol {
  MAINNET = 'mainnet',
  GOERLI = 'goerli',
  SEPOLIA = 'sepolia',
  MATIC = 'matic',
  MUMBAI = 'mumbai',
  AMOY = 'amoy',
  OFF_CHAIN = 'off-chain'
}
export enum URNType {
  BASE_AVATARS = 'base-avatars',
  COLLECTIONS_V2 = 'collections-v2',
  COLLECTIONS_THIRDPARTY = 'collections-thirdparty',
  ENTITY = 'entity'
}
export type URN = string

type BaseDecodedURN = {
  protocol: URNProtocol
  suffix: string
}
type BaseAvatarURN = { type: URNType.BASE_AVATARS }
type CollectionsV2URN = { type: URNType.COLLECTIONS_V2; collectionAddress: string; tokenId?: string }
type CollectionThirdPartyURN = {
  type: URNType.COLLECTIONS_THIRDPARTY
  thirdPartyName: string
  thirdPartyCollectionId?: string
  thirdPartyTokenId?: string
}
type EntityURN = { type: URNType.ENTITY; entityId: string; baseUrl?: string }
export type DecodedURN<T extends URNType = any> = BaseDecodedURN &
  (T extends URNType.BASE_AVATARS
    ? BaseAvatarURN
    : T extends URNType.COLLECTIONS_V2
    ? CollectionsV2URN
    : T extends URNType.COLLECTIONS_THIRDPARTY
    ? CollectionThirdPartyURN
    : T extends URNType.ENTITY
    ? EntityURN
    : BaseAvatarURN | CollectionsV2URN | CollectionThirdPartyURN | EntityURN)

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
  return `${thirdPartyCollectionId ?? ''}:${thirdPartyTokenId ?? ''}`
}

// TODO: This logic is repeated in collection/util's `getCollectionType`, but being used only for items (item.urn).
// It should probably be replaced by a getItemType or we should see if it's better to only keep one way of doing this
export function isThirdParty(urn?: string) {
  if (!urn) {
    return false
  }

  const decodedURN = decodeURN(urn)
  return decodedURN.type === URNType.COLLECTIONS_THIRDPARTY
}

export function extractEntityId(urn: URN): string {
  const decodedURN = decodeURN(urn)
  if (decodedURN.type !== URNType.ENTITY) {
    throw new Error('URN is not an entity URN')
  }

  return decodedURN.entityId
}

export function decodeURN(urn: URN): DecodedURN {
  const urnRegExp = new RegExp(
    `${baseMatcher}:(${protocolMatcher}:)?${typeMatcher}:(?<suffix>${baseAvatarsSuffixMatcher}|${collectionsSuffixMatcher}|${thirdPartySuffixMatcher}|${entitySuffixMatcher})`
  )
  const matches = urnRegExp.exec(urn)

  if (!matches || !matches.groups) {
    throw new Error(`Invalid URN: "${urn}"`)
  }

  return matches.groups as DecodedURN
}

function getNetworkURNProtocol(network: Network) {
  return getURNProtocol(getChainIdByNetwork(network))
}

export function extractCollectionAddress(urn: URN): string {
  const decodedURN = decodeURN(urn)
  if (decodedURN.type !== URNType.COLLECTIONS_V2) {
    throw new Error('URN is not a collections-v2 URN')
  }

  const { collectionAddress } = decodedURN

  return collectionAddress
}

export function extractTokenId(urn: URN): string {
  const decodedURN = decodeURN(urn)
  if (decodedURN.type !== URNType.COLLECTIONS_V2) {
    throw new Error('URN is not a collections-v2 URN')
  }

  const { collectionAddress, tokenId } = decodedURN

  if (!tokenId) {
    throw new Error('URN is not an Item URN')
  }

  return `${collectionAddress}:${tokenId ?? ''}`
}
