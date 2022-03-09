import { Address } from 'web3x/address'
import { constants } from 'ethers'
import { LocalItem } from '@dcl/builder-client'
import { utils } from 'decentraland-commons'
import { Entity } from 'dcl-catalyst-commons'
import future from 'fp-future'
import { getContentsStorageUrl } from 'lib/api/builder'
import { Collection } from 'modules/collection/types'
import { computeHashFromContent } from 'modules/deployment/contentUtils'
import { canSeeCollection, canMintCollectionItems, canManageCollectionItems } from 'modules/collection/utils'
import { isEqual } from 'lib/address'
import { sortByCreatedAt } from 'lib/sort'
import { extractThirdPartyTokenId, decodeURN } from 'lib/urn'
import { NO_CACHE_HEADERS } from 'lib/headers'
import {
  Item,
  ItemRarity,
  ItemType,
  WearableData,
  WearableBodyShape,
  BodyShapeType,
  RARITY_MAX_SUPPLY,
  RARITY_COLOR_LIGHT,
  RARITY_COLOR,
  WearableCategory,
  WearableBodyShapeType,
  IMAGE_CATEGORIES,
  THUMBNAIL_PATH,
  InitializeItem,
  CatalystItem,
  SyncStatus,
  ThirdPartyContractItem,
  ItemMetadataType,
  WearableRepresentation,
  GenerateImageOptions
} from './types'

export const MAX_FILE_SIZE = 2097152 // 2MB
export const MAX_NFTS_PER_MINT = 50
export const UNSYNCED_STATES = new Set([SyncStatus.UNSYNCED, SyncStatus.UNDER_REVIEW])

export function getMaxSupply(item: Item) {
  return getMaxSupplyForRarity(item.rarity!)
}

export function getMaxSupplyForRarity(rarity: ItemRarity) {
  return RARITY_MAX_SUPPLY[rarity]
}

export function getBodyShapeType(item: Item): BodyShapeType {
  const bodyShapes = getBodyShapes(item)
  const hasMale = bodyShapes.includes(WearableBodyShape.MALE)
  const hasFemale = bodyShapes.includes(WearableBodyShape.FEMALE)
  if (hasMale && hasFemale) {
    return BodyShapeType.BOTH
  } else if (hasMale) {
    return BodyShapeType.MALE
  } else if (hasFemale) {
    return BodyShapeType.FEMALE
  } else {
    throw new Error(`Couldn\'t find a valid representation: ${JSON.stringify(item.data.representations, null, 2)}`)
  }
}

export function getBodyShapes(item: Item): WearableBodyShape[] {
  const bodyShapes = new Set<WearableBodyShape>()
  for (const representation of item.data.representations) {
    for (const bodyShape of representation.bodyShapes) {
      bodyShapes.add(bodyShape)
    }
  }
  return Array.from(bodyShapes)
}

export function getMissingBodyShapeType(item: Item) {
  const existingBodyShapeType = getBodyShapeType(item)
  if (existingBodyShapeType === BodyShapeType.MALE) {
    return BodyShapeType.FEMALE
  }
  if (existingBodyShapeType === BodyShapeType.FEMALE) {
    return BodyShapeType.MALE
  }

  return null
}

export function hasBodyShape(item: Item, bodyShape: WearableBodyShape) {
  return item.data.representations.some(representation => representation.bodyShapes.includes(bodyShape))
}

export function toWearableBodyShapeType(wearableBodyShape: WearableBodyShape) {
  // wearableBodyShape looks like "urn:decentraland:off-chain:base-avatars:BaseMale" (WearableBodyShape.MALE) and we just want the "BaseMale" part
  return decodeURN(wearableBodyShape).suffix as WearableBodyShapeType
}

export function toBodyShapeType(wearableBodyShape: WearableBodyShape): BodyShapeType {
  switch (wearableBodyShape) {
    case WearableBodyShape.MALE:
      return BodyShapeType.MALE
    case WearableBodyShape.FEMALE:
      return BodyShapeType.FEMALE
  }
}

export function getRarityIndex(rarity: ItemRarity) {
  return {
    [ItemRarity.COMMON]: 0,
    [ItemRarity.UNCOMMON]: 1,
    [ItemRarity.RARE]: 2,
    [ItemRarity.EPIC]: 3,
    [ItemRarity.LEGENDARY]: 4,
    [ItemRarity.MYTHIC]: 5,
    [ItemRarity.UNIQUE]: 6
  }[rarity]
}

export function getBackgroundStyle(rarity?: ItemRarity) {
  return rarity
    ? { backgroundImage: `radial-gradient(${RARITY_COLOR_LIGHT[rarity]}, ${RARITY_COLOR[rarity]})` }
    : { backgroundColor: 'var(--secondary)' }
}

export function getItemMetadataType(item: Item) {
  if (Object.keys(item.contents).some(path => path.endsWith('.js'))) {
    return ItemMetadataType.SMART_WEARABLE
  }
  return ItemMetadataType.WEARABLE
}

export function buildItemMetadata(
  version: number,
  type: ItemMetadataType,
  name: string,
  description: string,
  category: string,
  bodyShapeTypes: string
): string {
  return `${version}:${type}:${name}:${description}:${category}:${bodyShapeTypes}`
}

// Metadata looks like this:
// - Common: version:item_type:representation_id
// - Wearables: version:item_type:representation_id:category:bodyshapes
export function getMetadata(item: Item) {
  switch (item.type) {
    case ItemType.WEARABLE: {
      const data = item.data as WearableData
      const bodyShapeTypes = getBodyShapes(item)
        .map(toWearableBodyShapeType)
        .join(',')

      if (!data.category) {
        throw new Error(`Unknown item category "${item.data}"`)
      }
      return buildItemMetadata(1, getItemMetadataType(item), item.name, item.description, data.category, bodyShapeTypes)
    }
    default:
      throw new Error(`Unknown item.type "${item.type}"`)
  }
}

export function toItemObject(items: Item[]) {
  return items.reduce((obj, item) => {
    obj[item.id] = utils.omit<Item>(item, ['collection'])
    return obj
  }, {} as Record<string, Item>)
}

export async function generateCatalystImage(item: Item | LocalItem, options?: GenerateImageOptions) {
  const catalystImage = await generateImage(item, options)
  const catalystImageHash = await computeHashFromContent(catalystImage)
  return {
    content: catalystImage,
    hash: catalystImageHash
  }
}

export async function generateImage(item: Item | LocalItem, options?: GenerateImageOptions): Promise<Blob> {
  // Set default width and height
  const width: number = options?.width ?? 256
  const height: number = options?.height ?? 256

  let thumbnail: Blob

  if (options?.thumbnail) {
    thumbnail = options.thumbnail
  } else {
    // fetch thumbnail
    const response = await fetch(getContentsStorageUrl(item.contents[item.thumbnail]), { headers: NO_CACHE_HEADERS })
    if (!response.ok) throw new Error(`Error generating the image: ${response.statusText}`)

    thumbnail = await response.blob()
  }

  // create canvas
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')

  // fail
  if (!context || !item.rarity) return thumbnail

  // render gradient
  const gradient = context.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 1.75)
  gradient.addColorStop(0, RARITY_COLOR_LIGHT[item.rarity!])
  gradient.addColorStop(1, RARITY_COLOR[item.rarity!])
  context.fillStyle = gradient
  context.fillRect(0, 0, width, height)

  // render item
  const img = document.createElement('img')
  const url = URL.createObjectURL(thumbnail)
  const load = future()
  img.onload = load.resolve
  img.src = url
  await load // wait for image to load
  URL.revokeObjectURL(url)
  context.drawImage(img, 0, 0, width, height)

  const blob = future<Blob>()
  canvas.toBlob(result => (result ? blob.resolve(result) : blob.reject(new Error('Error generating image blob'))))
  return blob
}

export async function resizeImage(image: Blob, width = 256, height = 256) {
  // create canvas
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')

  // fail
  if (!context) return image

  // render item
  const img = document.createElement('img')
  const url = URL.createObjectURL(image)
  const load = future()
  img.onload = load.resolve
  img.src = url
  await load // wait for image to load
  URL.revokeObjectURL(url)
  context.drawImage(img, 0, 0, width, height)

  const blob = future<Blob>()
  canvas.toBlob(result => (result ? blob.resolve(result) : blob.reject(new Error('Error generating image blob'))))
  return blob
}

export function isComplete(item: Item) {
  return item.beneficiary !== undefined && item.price !== undefined
}

export function isOwner(item: Item, address?: string) {
  return !!address && isEqual(item.owner, address)
}

export function canSeeItem(collection: Collection, item: Item, address: string): boolean {
  return canSeeCollection(collection, address) || isOwner(item, address)
}

export function canMintItem(collection: Collection, item: Item, address?: string): boolean {
  const totalSupply = item.totalSupply || 0
  return (
    !!address &&
    item.isPublished &&
    item.isApproved &&
    totalSupply < getMaxSupply(item) &&
    (isOwner(item, address) || canMintCollectionItems(collection, address))
  )
}

export function canManageItem(collection: Collection, item: Item, address?: string): boolean {
  return isOwner(item, address) || canManageCollectionItems(collection, address)
}

export function getThumbnailURL(item: Item) {
  return getContentsStorageUrl(item.contents[item.thumbnail])
}

export function getRarities() {
  return Object.values(ItemRarity)
}

export function isImageCategory(category: WearableCategory) {
  return IMAGE_CATEGORIES.includes(category)
}

export function isModelCategory(category: WearableCategory) {
  return !isImageCategory(category)
}

export function getModelCategories() {
  return Object.values(WearableCategory).filter(category => isModelCategory(category))
}

export function getSkinHiddenCategories() {
  return [
    WearableCategory.HEAD,
    WearableCategory.HAIR,
    WearableCategory.FACIAL_HAIR,
    WearableCategory.MOUTH,
    WearableCategory.EYEBROWS,
    WearableCategory.EYES,
    WearableCategory.UPPER_BODY,
    WearableCategory.LOWER_BODY,
    WearableCategory.FEET
  ]
}

function getCategories(contents: Record<string, any> | undefined = {}) {
  const fileNames = Object.keys(contents)
  return fileNames.some(isModelFile) ? getModelCategories() : IMAGE_CATEGORIES
}

export function getWearableCategories(contents: Record<string, any> | undefined = {}) {
  let categories = getCategories(contents).filter(category => category !== WearableCategory.HEAD)
  if (!process.env.REACT_APP_FF_SKINS) {
    categories = categories.filter(category => category !== WearableCategory.SKIN)
  }
  return categories
}

export function getOverridesCategories(contents: Record<string, any> | undefined = {}, category?: WearableCategory) {
  const overrideCategories = getCategories(contents)
  if (category === WearableCategory.SKIN) {
    return overrideCategories.filter(
      overrideCategory => !getSkinHiddenCategories().includes(overrideCategory) && overrideCategory !== WearableCategory.SKIN
    )
  }
  return overrideCategories
}

export function isFree(item: Item) {
  return item.price === '0' && item.beneficiary === Address.ZERO.toString()
}

export function isImageFile(fileName: string) {
  return fileName.toLowerCase().endsWith('.png')
}

export function isModelFile(fileName: string) {
  fileName = fileName.toLowerCase()
  return fileName.endsWith('.gltf') || fileName.endsWith('.glb')
}

export function isModelPath(fileName: string) {
  fileName = fileName.toLowerCase()
  // we ignore PNG files that end with "_mask", since those are auxiliary
  const isMask = fileName.includes('_mask')
  return isModelFile(fileName) || (fileName.indexOf(THUMBNAIL_PATH) === -1 && !isMask && isImageFile(fileName))
}

export function isValidText(text: string) {
  const invalidCharacters = [':']
  const invalidCharactersRegex = new RegExp(invalidCharacters.join('|'))
  return text.search(invalidCharactersRegex) === -1
}

export function isItemSizeError(error: string) {
  return error.search('The deployment is too big. The maximum allowed size per pointer is') !== -1
}

export function toThirdPartyContractItems(items: Item[]): ThirdPartyContractItem[] {
  return items.sort(sortByCreatedAt).map(item => [extractThirdPartyTokenId(item.urn!), getMetadata(item)])
}

export function toInitializeItems(items: Item[]): InitializeItem[] {
  return items.sort(sortByCreatedAt).map(toInitializeItem)
}

export function toInitializeItem(item: Item): InitializeItem {
  return [item.rarity!.toLowerCase(), item.price || '0', item.beneficiary ?? constants.AddressZero, getMetadata(item)]
}

export function areEqualArrays<T>(a: T[], b: T[]) {
  const setA = new Set(a)
  const setB = new Set(b)
  return setA.size === setB.size && a.every(elemA => setB.has(elemA)) && b.every(elemB => setA.has(elemB))
}

export function areEqualRepresentations(a: WearableRepresentation[], b: WearableRepresentation[]) {
  if (a.length !== b.length) {
    return false
  }
  for (let i = 0; i < a.length; i++) {
    const repA = a[i]
    const repB = b[i]
    const areEqual =
      areEqualArrays(repA.bodyShapes, repB.bodyShapes) &&
      areEqualArrays(repA.contents, repB.contents) &&
      repA.mainFile === repB.mainFile &&
      areEqualArrays(repA.overrideHides, repB.overrideHides) &&
      areEqualArrays(repA.overrideReplaces, repB.overrideReplaces)
    if (!areEqual) {
      return false
    }
  }
  return true
}

export function areSyncedByHash(item: Item): boolean {
  return !!item.currentContentHash && item.blockchainContentHash === item.currentContentHash
}

export function areSynced(item: Item, entity: Entity) {
  // check if metadata is synced
  const catalystItem = entity.metadata! as CatalystItem
  const hasMetadataChanged =
    item.name !== catalystItem.name ||
    item.description !== catalystItem.description ||
    item.data.category !== catalystItem.data.category ||
    item.data.hides.toString() !== catalystItem.data.hides.toString() ||
    item.data.replaces.toString() !== catalystItem.data.replaces.toString() ||
    item.data.tags.toString() !== catalystItem.data.tags.toString()
  if (hasMetadataChanged) {
    return false
  }

  // check if representations are synced
  if (!areEqualRepresentations(item.data.representations, catalystItem.data.representations)) {
    return false
  }

  // check if contents are synced
  const contents = entity.content!.reduce((map, entry) => map.set(entry.file, entry.hash), new Map<string, string>())
  for (const path in item.contents) {
    const hash = item.contents[path]
    if (contents.get(path) !== hash) {
      return false
    }
  }
  return true
}

export function isStatusAllowedToPushChanges(status: SyncStatus) {
  return [SyncStatus.UNDER_REVIEW, SyncStatus.UNSYNCED, SyncStatus.SYNCED].includes(status)
}

export function buildZipContents(contents: Record<string, Blob | string>, areEqual: boolean) {
  const newContents: Record<string, Blob | string> = {}
  const paths = Object.keys(contents)
  for (const path of paths) {
    const newPath = areEqual ? path.replace(BodyShapeType.FEMALE + '/', '').replace(BodyShapeType.MALE + '/', '') : path
    newContents[newPath] = contents[path]
  }
  return newContents
}

/**
 * Builds an array of arrays by taking chunks of an specified size of an array.
 * @param array - The array to get the groups of.
 * @param size - The size of the groups of the array.
 */
export function groupsOf<T>(array: T[], size: number): Array<Array<T>> {
  if (size === 0) {
    throw new Error('The groups size must be greater than 0')
  }

  const arrays = []
  for (let i = 0; i < array.length; i += size) {
    arrays.push(array.slice(i, i + size))
  }
  return arrays
}
