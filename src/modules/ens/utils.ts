import { ethers } from 'ethers'
import { Entity } from '@dcl/schemas'
import { getSigner } from 'decentraland-dapps/dist/lib/eth'
import { PEER_URL, getCatalystContentUrl } from 'lib/api/peer'
import { extractEntityId } from 'lib/urn'
import { WorldInfo, content } from 'lib/api/worlds'
import { DCLRegistrar__factory } from 'contracts/factories/DCLRegistrar__factory'
import { Land } from 'modules/land/types'
import { REGISTRAR_ADDRESS } from 'modules/common/contracts'
import { ENS, WorldStatus } from './types'

export const PRICE_IN_WEI = '100000000000000000000' // 100 MANA
export const PRICE = ethers.utils.formatEther(PRICE_IN_WEI)
export const MAX_NAME_SIZE = 15
export const MIN_NAME_SIZE = 2

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

export function setProfileFromEntity(entity: Entity): Entity {
  entity.metadata.avatars[0].avatar.snapshots.face = getCatalystContentUrl(entity.metadata.avatars[0].avatar.snapshots.face)
  entity.metadata.avatars[0].avatar.snapshots.body = getCatalystContentUrl(entity.metadata.avatars[0].avatar.snapshots.body)
  return entity
}

export async function getDefaultProfileEntity() {
  const req = await fetch(`${PEER_URL}/content/entities/profile?pointer=default${Math.floor(Math.random() * 128 + 1)}`)
  const profile = await req.json()
  return profile[0] as Entity
}

export async function isNameAvailable(name: string): Promise<boolean> {
  if (!name) {
    return false
  }
  const signer: ethers.Signer = await getSigner()
  const contractDCLRegistrar = DCLRegistrar__factory.connect(REGISTRAR_ADDRESS, signer)
  return contractDCLRegistrar.available(name)
}

export function hasNameMinLength(name: string): boolean {
  return name.length >= MIN_NAME_SIZE
}

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
  return ens.resolver === ethers.constants.AddressZero
}

export function isContentEmpty(ens: ENS) {
  return ens.content === ethers.constants.AddressZero
}

export function isEqualContent(ens: ENS, land: Land) {
  return ens.landId === land.id
}

export function getDomainFromName(name: string): string {
  return `${name.toLowerCase()}.dcl.eth`
}

export function isEnoughClaimMana(mana: string) {
  // 100 is the minimum amount of MANA the user needs to claim a new Name
  // We're checking against this instead of 0 when checking the allowance too because
  // we do not yet support the double transaction needed to set the user's allowance to 0 first and then bump it up to wichever number
  return Number(mana) >= 100
}

export function isExternalName(subdomain: string) {
  return !subdomain.endsWith('.dcl.eth')
}

export async function addWorldStatusToEachENS(enss: ENS[]) {
  const enssWithWorldStatus: ENS[] = []

  // This will be slow for users with plenty of ens names.
  // Same happens with dcl names as it uses a similar logic of fetching world info 1 by 1.
  for (const ens of enss) {
    let worldStatus: WorldStatus | null = null

    const world: WorldInfo | null = await content.fetchWorld(ens.subdomain)

    if (world) {
      const { healthy, configurations } = world
      const entityId = extractEntityId(configurations.scenesUrn[0])

      worldStatus = {
        healthy,
        scene: {
          urn: configurations.scenesUrn[0],
          entityId
        }
      }
    }

    enssWithWorldStatus.push({
      ...ens,
      worldStatus
    })
  }

  return enssWithWorldStatus
}
