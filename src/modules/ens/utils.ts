import { ethers } from 'ethers'
import { Entity } from '@dcl/schemas'
import { PEER_URL, getCatalystContentUrl } from 'lib/api/peer'
import { extractEntityId } from 'lib/urn'
import { WorldInfo, WorldsAPI } from 'lib/api/worlds'
import { config } from 'config'
import { Land } from 'modules/land/types'
import { ENS, WorldStatus } from './types'
import { getCenter, getSelection } from 'modules/land/utils'

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
  const worldsApi = new WorldsAPI()

  // This will be slow for users with plenty of ens names.
  // Same happens with dcl names as it uses a similar logic of fetching world info 1 by 1.
  for (const ens of enss) {
    let worldStatus: WorldStatus | null = null
    const world: WorldInfo | null = await worldsApi.fetchWorld(ens.subdomain)

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

const REDIRECT_PROTO_CODE = '0x3000f2'

function getRedirectParcel(land: Land) {
  const selection = getSelection(land)
  const [x, y] = getCenter(selection)
  return selection.find(parcel => parcel.x === x && parcel.y === y) ?? selection[0]
}

const withoutTrailingSlash = (path: string) => path.replace(/\/$/, '')

export function encodeLandRedirect(land: Land): string {
  const { x, y } = getRedirectParcel(land)
  return ethers.utils.hexConcat([REDIRECT_PROTO_CODE, ethers.utils.toUtf8Bytes(`${config.get('JUMP_URL')}?position=${x},${y}`)])
}

export function getRedirectedLandId(content: string, lands: Land[]): string | undefined {
  if (!content.toLowerCase().startsWith(REDIRECT_PROTO_CODE)) return undefined
  try {
    const url = new URL(ethers.utils.toUtf8String(ethers.utils.hexDataSlice(content, 3)))
    if (withoutTrailingSlash(`${url.origin}${url.pathname}`) !== withoutTrailingSlash(config.get('JUMP_URL'))) return undefined
    const [x, y] = (url.searchParams.get('position') ?? '').split(',').map(Number)
    return lands.find(land => getSelection(land).some(parcel => parcel.x === x && parcel.y === y))?.id
  } catch {
    return undefined
  }
}
