import { Address } from 'web3x-es/address'
import { ChainId, Network, getChainName } from '@dcl/schemas'
import { utils } from 'decentraland-commons'
import { getChainConfiguration } from 'decentraland-dapps/dist/lib/chainConfiguration'
import future from 'fp-future'
import { getContentsStorageUrl } from 'lib/api/builder'
import { Collection } from 'modules/collection/types'
import { canSeeCollection, canMintCollectionItems, canManageCollectionItems } from 'modules/collection/utils'
import { isEqual } from 'lib/address'
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
  THUMBNAIL_PATH
} from './types'

export const MAX_FILE_SIZE = 2097152 // 2MB
export const MAX_NFTS_PER_MINT = 50

export function getMaxSupply(item: Item) {
  return RARITY_MAX_SUPPLY[item.rarity!]
}

export function getCatalystItemURN(collection: Collection, item: Item, chainId: ChainId) {
  if (!collection.contractAddress || !item.tokenId) {
    throw new Error('You need the collection and item to be published to get the catalyst urn')
  }
  const config = getChainConfiguration(chainId)
  const chainName = getChainName(config.networkMapping[Network.MATIC])
  if (!chainName) {
    throw new Error(`Could not find a valid chain name for network ${Network.MATIC} on config ${JSON.stringify(config.networkMapping)}`)
  }
  return `urn:decentraland:${chainName.toLowerCase()}:collections-v2:${collection.contractAddress}:${item.tokenId}`
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
    throw new Error(`Couldn\'t find a valid representantion: ${JSON.stringify(item.data.representations, null, 2)}`)
  }
}

export function getBodyShapes(item: Item) {
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
  // wearableBodyShape looks like "urn:decentraland:off-chain:base-avatars:BaseMale" and we just want the "BaseMale" part
  return wearableBodyShape.split(':').pop() as WearableBodyShapeType
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

// Metadata looks like this:
// - Common: version:item_type:representation_id
// - Wearables: version:item_type:representation_id:category:bodyshapes
export function getMetadata(item: Item) {
  const version = 1
  const type = item.type[0]
  const slug = item.name
    .trim()
    .replace(/\s/, '-')
    .toLowerCase()

  switch (item.type) {
    case ItemType.WEARABLE: {
      const data = item.data as WearableData
      const bodyShapeTypes = getBodyShapes(item)
        .map(toWearableBodyShapeType)
        .join(',')
      return `${version}:${type}:${item.name}:${item.description}:${data.category}:${bodyShapeTypes}`
    }
    default:
      return `${version}:${type}:${slug}`
  }
}

export function toItemObject(items: Item[]) {
  return items.reduce((obj, item) => {
    obj[item.id] = utils.omit<Item>(item, ['collection'])
    return obj
  }, {} as Record<string, Item>)
}

export async function generateImage(item: Item, width = 256, height = 256) {
  // fetch thumbnail
  const response = await fetch(getThumbnailURL(item))
  if (!response.ok) throw new Error(`Error generating the image: ${response.statusText}`)

  const thumbnail = await response.blob()

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

export function hasOnChainDataChanged(originalItem: Item, item: Item) {
  return (
    originalItem.name !== item.name ||
    originalItem.description !== item.description ||
    originalItem.data.category !== item.data.category ||
    originalItem.price !== item.price ||
    originalItem.beneficiary !== item.beneficiary ||
    originalItem.rarity !== item.rarity
  )
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

function getCategories(contents: Record<string, any> | undefined = {}) {
  const fileNames = Object.keys(contents)
  return fileNames.some(isModelFile) ? Object.values(WearableCategory).filter(category => isModelCategory(category)) : IMAGE_CATEGORIES
}

export function getWearableCategories(contents: Record<string, any> | undefined = {}) {
  return getCategories(contents).filter(category => category !== WearableCategory.HEAD)
}

export function getOverridesCategories(contents: Record<string, any> | undefined = {}) {
  return getCategories(contents)
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
