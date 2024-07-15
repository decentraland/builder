import { getURNProtocol, Network } from '@dcl/schemas'
import slug from 'slug'
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
 *       collections-linked-wearables|
 *       entity
 *     ):
 *     (?<suffix>
 *       ((?<=base-avatars:)BaseMale|BaseFemale)|
 *       ((?<=collections-v2)0x[a-fA-F0-9]{40})|
 *       ((?<=collections-thirdparty:)
 *          (?<thirdPartyName>[^:|\\s]+)
 *          (:(?<thirdPartyCollectionId>[^:|\\s]+))?
 *          (:(?<thirdPartyTokenId>[^:|\\s]+))?
 *       )|
 *       ((?<=collections-linked-wearables:)
 *          (?<thirdPartyLinkedCollectionName>[^:|\\s]+)
 *          (:?<linkedCollectionNetwork>mainnet|sepolia|matic|amoy)
 *          (:?<linkedCollectionContractAddress>0x[a-fA-F0-9]{40})?
 *          (:(?<linkedCollectionTokenId>[^:|\\s]+))?)
 *       ((?<=entity:)(?<entityId>[^:|\\s]+)?\\?=\\&baseUrl=(?<baseUrl>https:[^=\\s]+)?)
 *     )
 *   )
 */
const baseMatcher = 'urn:decentraland'
const protocolMatcher = '(?<protocol>mainnet|goerli|sepolia|matic|mumbai|amoy|off-chain)'
const typeMatcher = '(?<type>base-avatars|collections-v2|collections-thirdparty|collections-linked-wearables|entity)'

const baseAvatarsSuffixMatcher = '((?<=base-avatars:)BaseMale|BaseFemale)'
const collectionsSuffixMatcher = '((?<=collections-v2:)(?<collectionAddress>0x[a-fA-F0-9]{40}))(:(?<tokenId>[^:|\\s]+))?'
const thirdPartySuffixMatcher = '((?<=collections-thirdparty:)(?<thirdPartyName>[^:|\\s]+)(:(?<thirdPartyCollectionId>[^:|\\s]+))?)'
const thirdPartyV2SuffixMatcher =
  '((?<=collections-linked-wearables:)(?<thirdPartyLinkedCollectionName>[^:|\\s]+)(:(?<linkedCollectionNetwork>mainnet|sepolia|matic|amoy):(?<linkedCollectionContractAddress>0x[a-fA-F0-9]{40}))?)'
const thirdPartyMatchers = `(:?${thirdPartySuffixMatcher}|${thirdPartyV2SuffixMatcher})(:(?<thirdPartyTokenId>[^:|\\s]+))?`

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
export enum LinkedContractProtocol {
  MAINNET = 'mainnet',
  SEPOLIA = 'sepolia',
  MATIC = 'matic',
  AMOY = 'amoy'
}
export enum URNType {
  BASE_AVATARS = 'base-avatars',
  COLLECTIONS_V2 = 'collections-v2',
  COLLECTIONS_THIRDPARTY = 'collections-thirdparty',
  COLLECTIONS_THIRDPARTY_V2 = 'collections-linked-wearables',
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
type CollectionThirdPartyV2URN = {
  type: URNType.COLLECTIONS_THIRDPARTY_V2
  thirdPartyLinkedCollectionName: string
  linkedCollectionNetwork: LinkedContractProtocol
  linkedCollectionContractAddress: string
  thirdPartyTokenId?: string
}
type EntityURN = { type: URNType.ENTITY; entityId: string; baseUrl?: string }
export type DecodedURN<T extends URNType = any> = BaseDecodedURN &
  (T extends URNType.BASE_AVATARS
    ? BaseAvatarURN
    : T extends URNType.COLLECTIONS_V2
    ? CollectionsV2URN
    : T extends URNType.COLLECTIONS_THIRDPARTY_V2
    ? CollectionThirdPartyV2URN
    : T extends URNType.COLLECTIONS_THIRDPARTY
    ? CollectionThirdPartyURN
    : T extends URNType.ENTITY
    ? EntityURN
    : BaseAvatarURN | CollectionsV2URN | CollectionThirdPartyURN | CollectionThirdPartyV2URN | EntityURN)

export function buildThirdPartyURN(thirdPartyName: string, collectionId: string, tokenId?: string) {
  let urn = `urn:decentraland:${getNetworkURNProtocol(Network.MATIC)}:collections-thirdparty:${thirdPartyName}:${collectionId}`
  if (tokenId) {
    urn += `:${tokenId}`
  }
  return urn
}

export function buildThirdPartyV2URN(
  thirdPartyName: string,
  thirdPartyLinkedContractNetwork: LinkedContractProtocol,
  thirdPartyLinkedContractAddress: string,
  tokenId?: string
) {
  let urn = `urn:decentraland:${getNetworkURNProtocol(
    Network.MATIC
  )}:collections-linked-wearables:${thirdPartyName}:${thirdPartyLinkedContractNetwork}:${thirdPartyLinkedContractAddress}`
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
  if (decodedURN.type !== URNType.COLLECTIONS_THIRDPARTY && decodedURN.type !== URNType.COLLECTIONS_THIRDPARTY_V2) {
    throw new Error('URN is not a third party URN')
  }

  if (decodedURN.type === URNType.COLLECTIONS_THIRDPARTY) {
    return `urn:decentraland:${decodedURN.protocol}:collections-thirdparty:${decodedURN.thirdPartyName}`
  } else {
    return `urn:decentraland:${decodedURN.protocol}:collections-linked-wearables:${decodedURN.thirdPartyLinkedCollectionName}`
  }
}

export function extractThirdPartyTokenId(urn: URN) {
  const decodedURN = decodeURN(urn)

  if (decodedURN.type === URNType.COLLECTIONS_THIRDPARTY) {
    const { thirdPartyCollectionId, thirdPartyTokenId } = decodedURN
    return `${thirdPartyCollectionId ?? ''}:${thirdPartyTokenId ?? ''}`
  } else if (decodedURN.type === URNType.COLLECTIONS_THIRDPARTY_V2) {
    const { linkedCollectionNetwork, linkedCollectionContractAddress, thirdPartyTokenId } = decodedURN
    return `${linkedCollectionNetwork}:${linkedCollectionContractAddress}:${thirdPartyTokenId ?? ''}`
  }

  throw new Error(`Tried to build a third party token for a non third party URN "${urn}"`)
}

// TODO: This logic is repeated in collection/util's `getCollectionType`, but being used only for items (item.urn).
// It should probably be replaced by a getItemType or we should see if it's better to only keep one way of doing this
export function isThirdParty(urn?: string, version?: URNType.COLLECTIONS_THIRDPARTY | URNType.COLLECTIONS_THIRDPARTY_V2) {
  if (!urn) {
    return false
  }

  const decodedURN = decodeURN(urn)
  if (version) {
    return decodedURN.type === version
  }

  return decodedURN.type === URNType.COLLECTIONS_THIRDPARTY || decodedURN.type === URNType.COLLECTIONS_THIRDPARTY_V2
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
    `${baseMatcher}:(${protocolMatcher}:)?${typeMatcher}:(?<suffix>${baseAvatarsSuffixMatcher}|${collectionsSuffixMatcher}|${thirdPartyMatchers}|${entitySuffixMatcher})`
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

export const decodedCollectionsUrnAreEqual = (urnA: DecodedURN, urnB: DecodedURN) => {
  if (urnA.type !== urnB.type) {
    return false
  }

  switch (urnA.type) {
    case URNType.COLLECTIONS_V2:
      return (
        urnA.collectionAddress === (urnB as DecodedURN<URNType.COLLECTIONS_V2>).collectionAddress &&
        urnA.tokenId === (urnB as DecodedURN<URNType.COLLECTIONS_V2>).tokenId
      )
    case URNType.COLLECTIONS_THIRDPARTY:
      return (
        urnA.thirdPartyName === (urnB as DecodedURN<URNType.COLLECTIONS_THIRDPARTY>).thirdPartyName &&
        urnA.thirdPartyCollectionId === (urnB as DecodedURN<URNType.COLLECTIONS_THIRDPARTY>).thirdPartyCollectionId &&
        urnA.thirdPartyTokenId === (urnB as DecodedURN<URNType.COLLECTIONS_THIRDPARTY>).thirdPartyTokenId
      )
    case URNType.COLLECTIONS_THIRDPARTY_V2:
      return (
        urnA.thirdPartyLinkedCollectionName === (urnB as DecodedURN<URNType.COLLECTIONS_THIRDPARTY_V2>).thirdPartyLinkedCollectionName &&
        urnA.linkedCollectionNetwork === (urnB as DecodedURN<URNType.COLLECTIONS_THIRDPARTY_V2>).linkedCollectionNetwork &&
        urnA.linkedCollectionContractAddress === (urnB as DecodedURN<URNType.COLLECTIONS_THIRDPARTY_V2>).linkedCollectionContractAddress &&
        urnA.thirdPartyTokenId === (urnB as DecodedURN<URNType.COLLECTIONS_THIRDPARTY_V2>).thirdPartyTokenId
      )
  }
}

export const isThirdPartyCollectionDecodedUrn = (
  urn: DecodedURN
): urn is DecodedURN<URNType.COLLECTIONS_THIRDPARTY> & { thirdPartyName: string; thirdPartyCollectionId: string } =>
  urn.type === URNType.COLLECTIONS_THIRDPARTY && !!urn.thirdPartyName && !!urn.thirdPartyCollectionId

export const isThirdPartyV2CollectionDecodedUrn = (
  urn: DecodedURN
): urn is DecodedURN<URNType.COLLECTIONS_THIRDPARTY_V2> & {
  thirdPartyLinkedCollectionName: string
  linkedCollectionNetwork: string
  linkedCollectionAddress: string
} =>
  urn.type === URNType.COLLECTIONS_THIRDPARTY_V2 &&
  !!urn.thirdPartyLinkedCollectionName &&
  !!urn.linkedCollectionNetwork &&
  !!urn.linkedCollectionContractAddress

export const getDefaultThirdPartyItemUrnSuffix = (itemName: string) => {
  const randHex = Array.from({ length: 4 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  return `${slug(itemName.length > 0 ? itemName : 'default')}-${randHex}`
}
