import { utils } from 'decentraland-commons'
import future from 'fp-future'
import { getContentsStorageUrl } from 'lib/api/builder'
import { Collection } from 'modules/collection/types'
import {
  Item,
  ItemRarity,
  ItemType,
  WearableData,
  WearableBodyShape,
  BodyShapeType,
  RARITY_MAX_SUPPLY,
  RARITY_COLOR_LIGHT,
  RARITY_COLOR
} from './types'

export function isComplete(item: Item) {
  return !isEditable(item) && !!item.beneficiary && !!item.price
}

export function isEditable(item: Item) {
  const data = item.data as WearableData
  return !item.rarity || !data.category
}

export function canMint(item: Item) {
  const totalSupply = item.totalSupply || 0
  return item.isPublished && totalSupply < getMaxSupply(item)
}

export function getMaxSupply(item: Item) {
  return RARITY_MAX_SUPPLY[item.rarity!]
}

export function getCatalystPointer(collection: Collection, item: Item) {
  if (!collection.contractAddress || !item.tokenId) {
    throw new Error('You need the collection and item to be published to get the catalyst entity id')
  }
  return `${collection.contractAddress}-${item.tokenId}`
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
    for (const bodyShape of representation.bodyShape) {
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
  return item.data.representations.some(representation => representation.bodyShape.includes(bodyShape))
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
        .map(bodyShape => bodyShape.split('/').pop())
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
  const thumbnailUrl = getContentsStorageUrl(item.contents[item.thumbnail])
  const thumbnail = await fetch(thumbnailUrl).then(response => response.blob())

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
