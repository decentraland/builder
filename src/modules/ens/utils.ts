import { ens_normalize } from '@adraffy/ens-normalize'
import { ethers } from 'ethers'
import { ENS_RESOLVER_ADDRESS } from 'modules/common/contracts'
import { Entity } from '@dcl/schemas'
import { PEER_URL, getCatalystContentUrl } from 'lib/api/peer'
import { extractEntityId } from 'lib/urn'
import { chunk } from 'lib/array'
import { WorldInfo, WorldsAPI } from 'lib/api/worlds'
import { Land, LandType } from 'modules/land/types'
import { ENS, WorldStatus } from './types'
import { getCenter, getSelection } from 'modules/land/utils'
import { BuilderClient, LandCoords, LandHashes } from '@dcl/builder-client'
import { getCurrentLocale } from 'decentraland-dapps/dist/modules/translation/utils'

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

/** Only the configured, chain-specific DCL deployment is trusted for Builder's legacy setters. */
export function isSupportedENSResolver(resolver: string): boolean {
  return (
    /^0x[0-9a-fA-F]{40}$/.test(ENS_RESOLVER_ADDRESS) &&
    ENS_RESOLVER_ADDRESS !== ethers.constants.AddressZero &&
    resolver.toLowerCase() === ENS_RESOLVER_ADDRESS.toLowerCase()
  )
}

export function isResolverEmpty(ens: ENS) {
  return !ens.resolver || ens.resolver === ethers.constants.AddressZero
}

export function isContentEmpty(ens: ENS) {
  return !ens.content || ens.content === '0x' || ens.content === ethers.constants.AddressZero
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

export async function getLandRedirectionHashes(builderClient: BuilderClient, lands: Land[]) {
  const coordsList = lands.map(land => getCenter(getSelection(land))).map(coords => ({ x: coords[0], y: coords[1] }))
  let coordsWithHashesList: (LandCoords & LandHashes)[] = []
  if (coordsList.length > 0) {
    for (const coordsBatch of chunk(coordsList, 145)) {
      coordsWithHashesList = coordsWithHashesList.concat(
        await builderClient.getLandRedirectionHashes(coordsBatch, getCurrentLocale().locale)
      )
    }
  }
  const landHashes: { id: string; hash: string }[] = []

  for (const { x, y, contentHash } of coordsWithHashesList) {
    const land = lands.find(land => {
      if (land.type === LandType.ESTATE) {
        return land.parcels!.some(parcel => parcel.x === x && parcel.y === y)
      }
      return land.x === x && land.y === y
    })

    if (land) {
      landHashes.push({ hash: `0x${contentHash}`, id: land.id })
    }
  }

  return landHashes
}

// ENS Universal Resolver proxy, deployed at the same address on Ethereum mainnet and Sepolia
export const UNIVERSAL_RESOLVER_ADDRESS = '0xeEeEEEeE14D718C2B47D9923Deab1335E144EeEe'

const universalResolverInterface = new ethers.utils.Interface([
  'function requireResolver(bytes name) view returns ((bytes name, uint256 offset, bytes32 node, address resolver, bool extended) info)',
  'error ResolverNotFound(bytes name)',
  'error ResolverNotContract(bytes name, address resolver)'
])

const resolverInterface = new ethers.utils.Interface([
  'function addr(bytes32 node) view returns (address)',
  'function contenthash(bytes32 node) view returns (bytes)',
  'function resolve(bytes name, bytes data) view returns (bytes)'
])

// Universal Resolver errors that mean the name has no resolver, as opposed to a failure while resolving it
const NAME_WITHOUT_RESOLVER_ERRORS = ['ResolverNotFound', 'ResolverNotContract']

function isNameWithoutResolver(result: string) {
  try {
    return NAME_WITHOUT_RESOLVER_ERRORS.includes(universalResolverInterface.parseError(result).name)
  } catch {
    return false
  }
}

/** Normalize once using ENSIP-15, then encode the same UTF-8 labels for DNS and namehash. */
export function encodeENSName(name: string): { name: string; dnsName: string; node: string } {
  const normalizedName = ens_normalize(name)
  const labels = normalizedName ? normalizedName.split('.').map(label => ethers.utils.toUtf8Bytes(label)) : []
  if (labels.some(label => label.length > 255)) {
    throw new Error('ENS labels cannot exceed 255 bytes')
  }
  const dnsName = ethers.utils.hexConcat([...labels.flatMap(label => [Uint8Array.of(label.length), label]), '0x00'])
  const node = labels.reduceRight(
    (node, label) => ethers.utils.keccak256(ethers.utils.concat([node, ethers.utils.keccak256(label)])),
    ethers.constants.HashZero
  )
  return { name: normalizedName, dnsName, node }
}

async function resolveRecord(
  provider: ethers.providers.Provider,
  name: string,
  record: 'addr' | 'contenthash'
): Promise<string | undefined> {
  const { dnsName: dnsEncodedName, node } = encodeENSName(name)
  const requireResolverResult = await provider.call({
    to: UNIVERSAL_RESOLVER_ADDRESS,
    data: universalResolverInterface.encodeFunctionData('requireResolver', [dnsEncodedName])
  })
  if (isNameWithoutResolver(requireResolverResult)) {
    return undefined
  }

  const [{ resolver, extended }] = universalResolverInterface.decodeFunctionResult('requireResolver', requireResolverResult)
  const recordData = resolverInterface.encodeFunctionData(record, [node])

  let recordResult: string
  if (extended) {
    // ENSIP-10 wildcard or offchain resolver: the address is requested through resolve(), which may use CCIP-Read
    const resolveResult = await provider.call({
      to: resolver,
      data: resolverInterface.encodeFunctionData('resolve', [dnsEncodedName, recordData]),
      ccipReadEnabled: true
    })
    ;[recordResult] = resolverInterface.decodeFunctionResult('resolve', resolveResult)
  } else {
    recordResult = await provider.call({ to: resolver, data: recordData, ccipReadEnabled: true })
  }

  if (ethers.utils.hexDataLength(recordResult) === 0) {
    return undefined
  }

  const [value] = resolverInterface.decodeFunctionResult(record, recordResult) as unknown as [string]
  return value === ethers.constants.AddressZero || value === '0x' ? undefined : value
}

/**
 * Resolves the ETH address of an ENS name through the name's current resolver, found by the ENS Universal Resolver.
 * Offchain (CCIP-Read) resolvers are supported. Returns undefined when the name has no resolver or no address,
 * and throws when the lookup itself fails, so an RPC or gateway error is not mistaken for a missing name.
 * Ported from decentraland-dapps' AddressField (decentraland/decentraland-dapps#833).
 */
export function resolveAddress(provider: ethers.providers.Provider, name: string): Promise<string | undefined> {
  return resolveRecord(provider, name, 'addr')
}

export function resolveContenthash(provider: ethers.providers.Provider, name: string): Promise<string | undefined> {
  return resolveRecord(provider, name, 'contenthash')
}
