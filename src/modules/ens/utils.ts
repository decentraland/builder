import { Address } from 'web3x-es/address'
import { Land } from 'modules/land/types'
import { ENS } from './types'

export const MAX_NAME_SIZE = 15

/**
 * The name may have a maximum of 15 characters (length === 15).
 * Names can contain:
 *  - Characters from 0-9, a-z, A-Z
 * Names can not contain:
 *  - Spaces
 *  - Special characters as '/', '_', ':', etc.
 *  - emojis
 */
const nameRegex = new RegExp(`^([a-zA-Z0-9]){2,${MAX_NAME_SIZE}}$`)
export function isNameValid(name: string): boolean {
  return nameRegex.test(name)
}

export function findBySubdomain(ensList: ENS[], subdomain: string) {
  return ensList.find(ens => ens.subdomain === subdomain)
}

export function isEmpty(ens: ENS) {
  return isResolverEmpty(ens) && isContentEmpty(ens)
}

export function isResolverEmpty(ens: ENS) {
  return ens.resolver === Address.ZERO.toString()
}

export function isContentEmpty(ens: ENS) {
  return ens.content === Address.ZERO.toString()
}

export function isEqualContent(ens: ENS, land: Land) {
  return ens.landId === land.id
}
