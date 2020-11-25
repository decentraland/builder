import { Address } from 'web3x-es/address'
import { Land } from 'modules/land/types'
import { ENS } from './types'

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

export function getDomainFromName(name: string): string {
  return `${name.toLowerCase()}.dcl.eth`
}

export function getNameFromDomain(domain: string): string {
  return domain.split('.')[0]
}
