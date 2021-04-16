import { ChainId, Network, getChainName } from '@dcl/schemas'
import { utils } from 'decentraland-commons'
import { Color4 } from 'decentraland-ecs'
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
  WearableCategory
} from './types'

export function getMaxSupply(item: Item) {
  return RARITY_MAX_SUPPLY[item.rarity!]
}

export function getCatalystItemURN(collection: Collection, item: Item, chainId: ChainId) {
  if (!collection.contractAddress || !item.tokenId) {
    throw new Error('You need the collection and item to be published to get the catalyst urn')
  }
  const config = getChainConfiguration(chainId)
  const chainName = getChainName(config.networkMapping[Network.MATIC])
  return `urn:decentraland:${chainName}:collections-v2:${collection.contractAddress}:${item.tokenId}`
}

export function getBodyShapeType(item: Item) {
  const bodyShapes = getBodyShapes(item)
  const hasMale = bodyShapes.includes(WearableBodyShape.MALE)
  const hasFemale = bodyShapes.includes(WearableBodyShape.FEMALE)
  if (hasMale && hasFemale) {
    return BodyShapeType.UNISEX
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
      const bodyShapes = getBodyShapes(item)
      return `${version}:${type}:${item.name}:${item.description}:${data.category}:${bodyShapes
        .map(bodyShape => bodyShape.split(':').pop()) // bodyShape is like "urn:decentraland:off-chain:base-avatars:BaseMale" and we just want the "BaseMale" part
        .join(',')}`
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

export async function generateImage(item: Item, width = 1024, height = 1024) {
  // fetch thumbnail
  const thumbnail = await fetch(getThumbnailURL(item)).then(response => response.blob())

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

export function isComplete(item: Item) {
  return !isEditable(item) && !!item.beneficiary && !!item.price
}

export function isEditable(item: Item) {
  const data = item.data as WearableData
  return !item.rarity || !data.category
}

export function isOwner(item: Item, address?: string) {
  return address && isEqual(item.owner, address)
}

export function canSeeItem(collection: Collection, item: Item, address: string) {
  return canSeeCollection(collection, address) || isEqual(item.owner, address)
}

export function canMintItem(collection: Collection, item: Item, address?: string) {
  const totalSupply = item.totalSupply || 0
  return (
    address &&
    item.isPublished &&
    item.isApproved &&
    totalSupply < getMaxSupply(item) &&
    (isOwner(item, address) || canMintCollectionItems(collection, address))
  )
}

export function canManageItem(collection: Collection, item: Item, address: string) {
  return isOwner(item, address) || canManageCollectionItems(collection, address)
}

export function hasOnChainDataChanged(originalItem: Item, item: Item) {
  return (
    originalItem.name !== item.name ||
    originalItem.description !== item.description ||
    originalItem.data.category !== item.data.category ||
    originalItem.price !== item.price ||
    originalItem.beneficiary !== item.beneficiary ||
    originalItem.rarity !== item.rarity ||
    JSON.stringify(originalItem.data) !== JSON.stringify(item.data)
  )
}

export function getThumbnailURL(item: Item) {
  return getContentsStorageUrl(item.contents[item.thumbnail])
}

export function getRarities() {
  return Object.values(ItemRarity)
}

export function getCategories(contents: Record<string, any> | undefined = {}) {
  const SIMPLE_WEARABLE_CATEGORIES = [WearableCategory.EYEBROWS, WearableCategory.EYES, WearableCategory.MOUTH]
  const fileNames = Object.keys(contents)

  return fileNames.some(isComplexFile)
    ? Object.values(WearableCategory).filter(category => !SIMPLE_WEARABLE_CATEGORIES.includes(category))
    : SIMPLE_WEARABLE_CATEGORIES
}

export function isComplexFile(fileName: string) {
  return fileName.endsWith('.gltf') || fileName.endsWith('.glb')
}

export function getSkinColors() {
  return [
    new Color4(1, 0.8941177, 0.7764706, 1),
    new Color4(1, 0.8666667, 0.7372549, 1),
    new Color4(0.9490196, 0.7607843, 0.6470588, 1),
    new Color4(0.8666667, 0.6941177, 0.5607843, 1),
    new Color4(0.8, 0.6078432, 0.4666667, 1),
    new Color4(0.6039216, 0.4627451, 0.3568628, 1),
    new Color4(0.4392157, 0.3647059, 0.2784314, 1),
    new Color4(0.4392157, 0.2980392, 0.2196078, 1),
    new Color4(0.3215686, 0.172549, 0.1098039, 1),
    new Color4(0.2352941, 0.1333333, 0.08627451, 1)
  ]
}

export function getHairColors() {
  return [
    new Color4(0.1098039, 0.1098039, 0.1098039, 1),
    new Color4(0.2352941, 0.1294118, 0.04313726, 1),
    new Color4(0.3568628, 0.1921569, 0.05882353, 1),
    new Color4(0.4823529, 0.282353, 0.09411765, 1),
    new Color4(0.5960785, 0.372549, 0.2156863, 1),
    new Color4(0.5490196, 0.1254902, 0.07843138, 1),
    new Color4(0.9137255, 0.509804, 0.2039216, 1),
    new Color4(1, 0.7450981, 0.1568628, 1),
    new Color4(9803922, 0.8235294, 5058824, 1),
    new Color4(9254902, 0.9098039, 0.8862745, 1)
  ]
}

export function getEyeColors() {
  return [
    new Color4(0.2117647, 0.1490196, 0.1490196, 1),
    new Color4(0.372549, 0.2235294, 0.1960784, 1),
    new Color4(0.5254902, 0.3803922, 0.2588235, 1),
    new Color4(0.7490196, 0.6196079, 0.3529412, 1),
    new Color4(0.5294118, 0.5019608, 0.4705882, 1),
    new Color4(0.6862745, 0.772549, 0.7803922, 1),
    new Color4(0.1254902, 0.7019608, 0.9647059, 1),
    new Color4(0.2235294, 0.4862745, 0.6901961, 1),
    new Color4(0.282353, 0.8627451, 0.4588235, 1),
    new Color4(0.2313726, 0.6235294, 0.3137255, 1)
  ]
}
