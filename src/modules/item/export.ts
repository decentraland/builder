import { Locale, Rarity, ThirdPartyWearable, WearableCategory, WearableRepresentation } from '@dcl/schemas'
import { CatalystClient, DeploymentPreparationData } from 'dcl-catalyst-client'
import { MerkleDistributorInfo } from '@dcl/content-hash-tree/dist/types'
import { EntityType } from 'dcl-catalyst-commons'
import { calculateMultipleHashesADR32, calculateMultipleHashesADR32LegacyQmHash } from '@dcl/hashing'
import { BuilderAPI } from 'lib/api/builder'
import { buildCatalystItemURN } from 'lib/urn'
import { makeContentFiles, computeHashes } from 'modules/deployment/contentUtils'
import { Collection } from 'modules/collection/types'
import { Item, IMAGE_PATH, THUMBNAIL_PATH, StandardCatalystItem, ItemType, EmoteData, EmoteCategory, EntityHashingType } from './types'
import { generateCatalystImage, generateImage } from './utils'

/**
 * Downloads content that has an old hash.
 *
 * @param contents - The contents to be updated.
 * @returns A map with the contents that have been updated.
 */
export async function reHashOlderContents(
  contents: Record<string, string>,
  legacyBuilderClient: BuilderAPI
): Promise<Record<string, { hash: string; content: Blob }>> {
  const contentsWithOldHashes = Object.fromEntries(Object.entries(contents).filter(([_, content]) => content.startsWith('Qm')))
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
export async function calculateFinalSize(item: Item, newContents: Record<string, Blob>, legacyBuilderClient: BuilderAPI): Promise<number> {
  const newHashes = await computeHashes(newContents)
  const filesToDownload: Record<string, string> = {}
  for (const fileName in item.contents) {
    if (!newHashes[fileName] || item.contents[fileName] !== newHashes[fileName]) {
      filesToDownload[fileName] = item.contents[fileName]
    }
  }

  const blobs = await legacyBuilderClient.fetchContents(filesToDownload)
  // const blobs = await getFiles(filesToDownload)
  const allBlobs = { ...newContents, ...blobs }
  const allHashes = { ...newHashes, ...filesToDownload }

  let imageSize = 0
  // Only generate the catalyst image if there isn't one already
  if (!allBlobs[IMAGE_PATH]) {
    try {
      const image = await generateImage(item, { thumbnail: allBlobs[THUMBNAIL_PATH] })
      imageSize = image.size
    } catch (error) {}
  }

  const uniqueFiles = getUniqueFiles(allHashes, allBlobs)
  return imageSize + calculateFilesSize(uniqueFiles)
}

/**
 * Sums the sizes of an array of blobs.
 *
 * @param files - An array of blobs.
 */
function calculateFilesSize(files: Array<Blob>) {
  return files.reduce((total, blob) => blob.size + total, 0)
}

function getMerkleProof(tree: MerkleDistributorInfo, entityHash: string, entityValues: Omit<ThirdPartyWearable, 'merkleProof'>) {
  const hashingKeys = Object.keys(entityValues)
  const { index, proof } = tree.proofs[entityHash]
  return {
    index,
    proof,
    hashingKeys,
    entityHash
  }
}

function buildTPItemEntityMetadata(item: Item, itemHash: string, tree: MerkleDistributorInfo): ThirdPartyWearable {
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
      replaces: item.data.replaces as WearableCategory[],
      hides: item.data.hides as WearableCategory[],
      tags: item.data.tags,
      category: item.data.category as WearableCategory,
      representations: item.data.representations as WearableRepresentation[]
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

function buildItemEntityMetadata(collection: Collection, item: Item): StandardCatalystItem {
  if (!collection.contractAddress || !item.tokenId) {
    throw new Error('You need the collection and item to be published')
  }

  // The order of the metadata properties can't be changed. Changing it will result in a different content hash.
  const catalystItem: StandardCatalystItem = {
    id: buildCatalystItemURN(collection.contractAddress!, item.tokenId!),
    name: item.name,
    description: item.description,
    collectionAddress: collection.contractAddress!,
    rarity: (item.rarity! as unknown) as Rarity,
    i18n: [{ code: Locale.EN, text: item.name }],
    data: {
      replaces: item.data.replaces as WearableCategory[],
      hides: item.data.hides as WearableCategory[],
      tags: item.data.tags,
      category: item.data.category as WearableCategory,
      representations: item.data.representations as WearableRepresentation[]
    },
    image: IMAGE_PATH,
    thumbnail: THUMBNAIL_PATH,
    metrics: item.metrics
  }

  if (item.type === ItemType.EMOTE) {
    catalystItem.emoteDataV0 = {
      loop: (item.data as EmoteData).category === EmoteCategory.LOOP
    }
  }

  return catalystItem
}

async function buildItemEntityContent(item: Item): Promise<Record<string, string>> {
  const contents = { ...item.contents }
  if (!item.contents[IMAGE_PATH]) {
    const catalystItem = await generateCatalystImage(item)
    contents[IMAGE_PATH] = catalystItem.hash
  }

  return contents
}

async function buildItemEntityBlobs(item: Item, legacyBuilderClient: BuilderAPI): Promise<Record<string, Blob>> {
  const [files, image] = await Promise.all([
    legacyBuilderClient.fetchContents(item.contents),
    !item.contents[IMAGE_PATH] ? generateImage(item) : null
  ])
  files[IMAGE_PATH] = image ?? files[IMAGE_PATH]
  return files
}

export async function buildItemEntity(
  client: CatalystClient,
  legacyBuilderClient: BuilderAPI,
  collection: Collection,
  item: Item,
  tree?: MerkleDistributorInfo,
  itemHash?: string
): Promise<DeploymentPreparationData> {
  const blobs = await buildItemEntityBlobs(item, legacyBuilderClient)
  const files = await makeContentFiles(blobs)
  const metadata = tree && itemHash ? buildTPItemEntityMetadata(item, itemHash, tree) : buildItemEntityMetadata(collection, item)
  return client.buildEntity({
    type: EntityType.WEARABLE,
    pointers: [metadata.id],
    metadata,
    files,
    timestamp: Date.now()
  })
}

export async function buildStandardItemEntity(
  client: CatalystClient,
  legacyBuilderClient: BuilderAPI,
  collection: Collection,
  item: Item
): Promise<DeploymentPreparationData> {
  return buildItemEntity(client, legacyBuilderClient, collection, item)
}

export async function buildTPItemEntity(
  client: CatalystClient,
  legacyBuilderClient: BuilderAPI,
  collection: Collection,
  item: Item,
  tree: MerkleDistributorInfo,
  itemHash: string
): Promise<DeploymentPreparationData> {
  return buildItemEntity(client, legacyBuilderClient, collection, item, tree, itemHash)
}

export async function buildStandardWearableContentHash(
  collection: Collection,
  item: Item,
  hashingType = EntityHashingType.V1
): Promise<string> {
  const hashes = await buildItemEntityContent(item)
  const content = Object.keys(hashes).map(file => ({ file, hash: hashes[file] }))
  const metadata = buildItemEntityMetadata(collection, item)
  if (hashingType === EntityHashingType.V0) {
    return (await calculateMultipleHashesADR32LegacyQmHash(content, metadata)).hash
  } else {
    return (await calculateMultipleHashesADR32(content, metadata)).hash
  }
}
