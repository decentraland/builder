import { Emote, EntityType, Locale, Rarity, Wearable, WearableCategory, WearableRepresentation } from '@dcl/schemas'
import { DeploymentPreparationData, buildEntity } from 'dcl-catalyst-client/dist/client/utils/DeploymentBuilder'
import { MerkleDistributorInfo } from '@dcl/content-hash-tree/dist/types'
import { calculateMultipleHashesADR32, calculateMultipleHashesADR32LegacyQmHash } from '@dcl/hashing'
import { BuilderAPI } from 'lib/api/builder'
import { buildCatalystItemURN } from 'lib/urn'
import { makeContentFiles, computeHashes } from 'modules/deployment/contentUtils'
import { Collection } from 'modules/collection/types'
import { Item, IMAGE_PATH, THUMBNAIL_PATH, ItemType, EntityHashingType, isEmoteItemType, VIDEO_PATH } from './types'
import { EMPTY_ITEM_METRICS, generateCatalystImage, generateImage } from './utils'

/**
 * Checks if a hash was generated using an older algorithm.
 *
 * @param hash - A hash.
 * @returns true if the hash is from an older version.
 */
export function isOldHash(hash: string): boolean {
  return hash.startsWith('Qm')
}

/**
 * Checks if an item has content hashes generated using an older algorithm.
 *
 * @param item - An item.
 * @returns true if the item has older hashes.
 */
export function hasOldHashedContents(item: Item): boolean {
  return Object.values(item.contents).some(hash => isOldHash(hash))
}

/**
 * Takes a map of contents (file name -> hash), downloads the contents that are hashed with an older algorithm
 * and builds a new map that contains the content and their hash.
 *
 * @param contents - The contents to be updated.
 * @returns A map containing only the contents that have been updated and re-hashed.
 */
export async function reHashOlderContents(
  contents: Record<string, string>,
  legacyBuilderClient: BuilderAPI
): Promise<Record<string, { hash: string; content: Blob }>> {
  const contentsWithOldHashes = Object.fromEntries(Object.entries(contents).filter(([_, content]) => isOldHash(content)))
  const contentOfOldHashedFiles = await legacyBuilderClient.fetchContents(contentsWithOldHashes)
  const newHashesOfOldHashedFiles = await computeHashes(contentOfOldHashedFiles)
  return Object.fromEntries(
    Object.keys(contentsWithOldHashes).map(key => [key, { hash: newHashesOfOldHashedFiles[key], content: contentOfOldHashedFiles[key] }])
  )
}

/**
 * Gets an array of unique files based on their hashes.
 *
 * @param hashes - The record of names->hashes.
 * @param blobs - The record of names->blobs.
 */
function getUniqueFiles(hashes: Record<string, string>, blobs: Record<string, Blob>): Array<Blob> {
  const uniqueFileHashes: Array<string> = [...new Set(Object.values(hashes))]
  const inverseFileHashesRecord = Object.keys(hashes).reduce((obj: Record<string, string>, key: string) => {
    obj[hashes[key]] = key
    return obj
  }, {})
  return uniqueFileHashes.map(hash => blobs[inverseFileHashesRecord[hash]])
}

/**
 * Calculates the final size (with the already stored content and the new one) of the contents of an item.
 * All the files in newContents must also be in the item's contents in both name and hash.
 *
 * @param item - An item that contains the old and the new hashed content.
 * @param newContents - The new content that is going to be added to the item.
 */
export async function calculateModelFinalSize(
  oldContents: Record<string, string>,
  newContents: Record<string, Blob>,
  legacyBuilderClient: BuilderAPI
): Promise<number> {
  const newHashes = await computeHashes(newContents)
  const newContentHasModel = Object.keys(newContents).some(key => key.endsWith('.glb'))
  const filesToDownload: Record<string, string> = {}
  for (const fileName in oldContents) {
    const isModel = fileName.endsWith('.glb')
    const isVideo = fileName.endsWith('.mp4') // do not take into account the video size for the smart wearables
    const isNotPartOfNewContent = !newContents[fileName]
    const fileHasDifferentHash = oldContents[fileName] !== newHashes[fileName]
    // download the old file if it's not part of the new content or if it has a different hash from the actual
    // and it's not a model or if it's a model and the new content doesn't have a model and it's not a video
    if ((isNotPartOfNewContent || fileHasDifferentHash) && (!newContentHasModel || (newContentHasModel && !isModel)) && !isVideo) {
      filesToDownload[fileName] = oldContents[fileName]
    }
  }

  const blobs = await legacyBuilderClient.fetchContents(filesToDownload)
  const allBlobs = { ...newContents, ...blobs }
  const allHashes = { ...newHashes, ...filesToDownload }

  const uniqueFiles = getUniqueFiles(allHashes, allBlobs)
  return calculateFilesSize(uniqueFiles)
}

export function calculateFileSize(file: Blob): number {
  return calculateFilesSize([file])
}

/**
 * Sums the sizes of an array of blobs.
 *
 * @param files - An array of blobs.
 */
function calculateFilesSize(files: Array<Blob>) {
  return files.reduce((total, blob) => blob.size + total, 0)
}

function getMerkleProof(tree: MerkleDistributorInfo, entityHash: string, entityValues: Omit<Wearable, 'merkleProof'>) {
  const hashingKeys = Object.keys(entityValues)
  const { index, proof } = tree.proofs[entityHash]
  return {
    index,
    proof,
    hashingKeys,
    entityHash
  }
}

function buildTPItemEntityMetadata(item: Item, itemHash: string, tree: MerkleDistributorInfo): Wearable {
  if (!item.urn) {
    throw new Error('Item does not have URN')
  }

  // The order of the metadata properties can't be changed. Changing it will result in a different content hash.
  const baseEntityData = {
    id: item.urn,
    name: item.name,
    description: item.description,
    i18n: [{ code: Locale.EN, text: item.name }],
    data: {
      replaces: item.data.replaces,
      hides: item.data.hides,
      ...('removesDefaultHiding' in item.data ? { removesDefaultHiding: item.data.removesDefaultHiding } : {}),
      tags: item.data.tags,
      category: item.data.category as WearableCategory,
      representations: item.data.representations as WearableRepresentation[],
      ...('blockVrmExport' in item.data ? { blockVrmExport: item.data.blockVrmExport } : {})
    },
    image: IMAGE_PATH,
    thumbnail: THUMBNAIL_PATH,
    metrics: item.metrics,
    content: item.contents
  }

  return {
    ...baseEntityData,
    merkleProof: getMerkleProof(tree, itemHash, baseEntityData)
  }
}

function buildWearableEntityMetadata(collection: Collection, item: Item): Wearable {
  if (!collection.contractAddress || !item.tokenId) {
    throw new Error('You need the collection and item to be published')
  }

  // The order of the metadata properties can't be changed. Changing it will result in a different content hash.
  const catalystItem: Wearable = {
    id: buildCatalystItemURN(collection.contractAddress, item.tokenId),
    name: item.name,
    description: item.description,
    collectionAddress: collection.contractAddress,
    rarity: item.rarity! as unknown as Rarity,
    i18n: [{ code: Locale.EN, text: item.name }],
    data: {
      replaces: item.data.replaces,
      hides: item.data.hides,
      ...('removesDefaultHiding' in item.data ? { removesDefaultHiding: item.data.removesDefaultHiding } : {}),
      tags: item.data.tags,
      category: item.data.category!,
      representations: item.data.representations,
      ...('blockVrmExport' in item.data ? { blockVrmExport: item.data.blockVrmExport } : {})
    },
    image: IMAGE_PATH,
    thumbnail: THUMBNAIL_PATH,
    metrics: item.metrics
  }

  return catalystItem
}

function buildADR74EmoteEntityMetadata(collection: Collection, item: Item<ItemType.EMOTE>): Emote {
  if (!collection.contractAddress || !item.tokenId) {
    throw new Error('You need the collection and item to be published')
  }

  // The order of the metadata properties can't be changed. Changing it will result in a different content hash.
  const catalystItem: Emote = {
    id: buildCatalystItemURN(collection.contractAddress, item.tokenId),
    name: item.name,
    description: item.description,
    collectionAddress: collection.contractAddress,
    rarity: item.rarity! as unknown as Rarity,
    i18n: [{ code: Locale.EN, text: item.name }],
    emoteDataADR74: {
      category: item.data.category,
      representations: item.data.representations,
      tags: item.data.tags,
      loop: item.data.loop
    },
    image: IMAGE_PATH,
    thumbnail: THUMBNAIL_PATH,
    metrics: EMPTY_ITEM_METRICS
  }

  return catalystItem
}

async function buildItemEntityContent(item: Item): Promise<Record<string, string>> {
  const contents = { ...item.contents }
  if (!item.contents[IMAGE_PATH]) {
    const catalystItem = await generateCatalystImage(item)
    contents[IMAGE_PATH] = catalystItem.hash
  }

  if (VIDEO_PATH in contents) {
    delete contents[VIDEO_PATH]
  }

  return contents
}

async function buildItemEntityBlobs(item: Item | Item<ItemType.EMOTE>, legacyBuilderClient: BuilderAPI): Promise<Record<string, Blob>> {
  const [files, image] = await Promise.all([
    legacyBuilderClient.fetchContents(item.contents),
    !item.contents[IMAGE_PATH] ? generateImage(item) : null
  ])
  files[IMAGE_PATH] = image ?? files[IMAGE_PATH]
  if (VIDEO_PATH in files) {
    delete files[VIDEO_PATH]
  }
  return files
}

export async function buildItemEntity(
  legacyBuilderClient: BuilderAPI,
  collection: Collection,
  item: Item | Item<ItemType.EMOTE>,
  tree?: MerkleDistributorInfo,
  itemHash?: string
): Promise<DeploymentPreparationData> {
  const blobs = await buildItemEntityBlobs(item, legacyBuilderClient)
  const files = await makeContentFiles(blobs)
  let metadata
  const isEmote = isEmoteItemType(item) //TODO: @Emotes remove this FF once launched
  if (isEmote) {
    metadata = buildADR74EmoteEntityMetadata(collection, item)
  } else if (tree && itemHash) {
    metadata = buildTPItemEntityMetadata(item, itemHash, tree)
  } else {
    // Emotes will be deployed as Wearables ultil they are released
    metadata = buildWearableEntityMetadata(collection, item)
  }
  return buildEntity({
    type: isEmote ? EntityType.EMOTE : EntityType.WEARABLE,
    pointers: [metadata.id],
    metadata,
    files,
    timestamp: Date.now()
  })
}

export async function buildStandardItemEntity(
  legacyBuilderClient: BuilderAPI,
  collection: Collection,
  item: Item
): Promise<DeploymentPreparationData> {
  return buildItemEntity(legacyBuilderClient, collection, item)
}

export async function buildTPItemEntity(
  legacyBuilderClient: BuilderAPI,
  collection: Collection,
  item: Item,
  tree: MerkleDistributorInfo,
  itemHash: string
): Promise<DeploymentPreparationData> {
  return buildItemEntity(legacyBuilderClient, collection, item, tree, itemHash)
}

export async function buildStandardWearableContentHash(
  collection: Collection,
  item: Item,
  hashingType = EntityHashingType.V1
): Promise<string> {
  const hashes = await buildItemEntityContent(item)
  const content = Object.keys(hashes).map(file => ({ file, hash: hashes[file] }))
  const metadata = isEmoteItemType(item) ? buildADR74EmoteEntityMetadata(collection, item) : buildWearableEntityMetadata(collection, item)
  if (hashingType === EntityHashingType.V0) {
    return (await calculateMultipleHashesADR32LegacyQmHash(content, metadata)).hash
  } else {
    return (await calculateMultipleHashesADR32(content, metadata)).hash
  }
}
