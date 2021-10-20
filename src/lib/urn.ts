import { getURNProtocol, Network } from '@dcl/schemas'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'

export const VERSION = 1
export const DELIMITER = ':'

export function buildItemURN(type: string, name: string, description: string, category: string, bodyShapeTypes: string) {
  return `${VERSION}:${type[0]}:${name}:${description}:${category}:${bodyShapeTypes}`
}

export function getCatalystItemURN(contractAddress: string, tokenId: string) {
  return `urn:decentraland:${getURNProtocol(getChainIdByNetwork(Network.MATIC))}:collections-v2:${contractAddress}:${tokenId}`
}

export function toLegacyURN(urn: string) {
  return urn.replace('urn:decentraland:off-chain:base-avatars:', 'dcl://base-avatars/')
}

export function join(...args: string[]) {
  return args.join(DELIMITER)
}

export function pop(urn: string) {
  return urn.split(DELIMITER).pop()
}
