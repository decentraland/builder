import { Authenticator, AuthIdentity } from 'dcl-crypto'
import { ChainId } from '@dcl/schemas'
import { CatalystClient } from 'dcl-catalyst-client'
import { EntityType } from 'dcl-catalyst-commons'
import { getContentsStorageUrl } from 'lib/api/builder'
import { PEER_URL } from 'lib/api/peer'
import { NO_CACHE_HEADERS } from 'lib/headers'
import { getCatalystItemURN } from 'modules/item/utils'
import { makeContentFiles, computeHashes } from 'modules/deployment/contentUtils'
import { Collection } from 'modules/collection/types'
import { CatalystItem, Item, IMAGE_PATH, THUMBNAIL_PATH } from './types'
import { generateImage } from './utils'

const ITEM_DEPLOYMENT_DELTA_TIMESTAMP = -5 * 1000 // We use 5 seconds before to let the subgraph index the collection creation

export async function deployContents(identity: AuthIdentity, collection: Collection, item: Item, chainId: ChainId) {
  const urn = getCatalystItemURN(collection, item, chainId)
  const [files, image] = await Promise.all([getFiles(item.contents), generateImage(item)])
  const contentFiles = await makeContentFiles({ ...files, [IMAGE_PATH]: image })
  const catalystItem = toCatalystItem(collection, item, chainId)
  const client = new CatalystClient(PEER_URL, 'Builder')
  const status = await client.fetchContentStatus()
  const { entityId, files: hashedFiles } = await client.buildEntity({
    type: EntityType.WEARABLE,
    pointers: [urn],
    metadata: catalystItem,
    files: contentFiles,
    timestamp: status.currentTime + ITEM_DEPLOYMENT_DELTA_TIMESTAMP
  })
  const authChain = Authenticator.signPayload(identity, entityId)

  await client.deployEntity({ entityId, files: hashedFiles, authChain })

  return { ...item, inCatalyst: true }
}

function toCatalystItem(collection: Collection, item: Item, chainId: ChainId): CatalystItem {
  // We strip the thumbnail from the representations contents as they're not being used by the Catalyst and just occupy extra space
  const representations = item.data.representations.map(representation => ({
    ...representation,
    contents: representation.contents.filter(fileName => fileName !== THUMBNAIL_PATH)
  }))
  return {
    id: getCatalystItemURN(collection, item, chainId),
    name: item.name,
    description: item.description,
    collectionAddress: collection.contractAddress!,
    rarity: item.rarity,
    i18n: [{ code: 'en', text: item.name }],
    data: {
      replaces: item.data.replaces,
      hides: item.data.hides,
      tags: item.data.tags,
      category: item.data.category,
      representations
    },
    image: IMAGE_PATH,
    thumbnail: THUMBNAIL_PATH,
    metrics: item.metrics,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
}

/**
 * Downloads item contents.
 * Commonly used to download already uploaded representations of an item.
 *
 * @param contents - The record of contents to be fetched.
 */
export async function getFiles(contents: Record<string, string>): Promise<Record<string, Blob>> {
  const promises = Object.keys(contents).map(path => {
    const url = getContentsStorageUrl(contents[path])

    return fetch(url, { headers: NO_CACHE_HEADERS })
      .then(resp => resp.blob())
      .then(blob => ({ path, blob }))
  })

  const results = await Promise.all(promises)

  return results.reduce<Record<string, Blob>>((files, file) => {
    files[file.path] = file.blob
    return files
  }, {})
}

/**
 * Gets an array of unique files based on their hashes.
 *
 * @param hashes - The record of names->hashes.
 * @param blobs - The record of names->blobs.
 */
function getUniqueFiles(hashes: Record<string, string>, blobs: Record<string, Blob>): Array<Blob> {
  const uniqueFileHases: Array<string> = [...new Set(Object.values(hashes))]
  const inverseFileHashesRecord = Object.keys(hashes).reduce((obj: Record<string, string>, key: string) => {
    obj[hashes[key]] = key
    return obj
  }, {})
  return uniqueFileHases.map(hash => blobs[inverseFileHashesRecord[hash]])
}

/**
 * Calculates the final size (with the already stored content and the new one) of the contents of an item.
 *
 * @param item - An item that might or not have already uploaded content.
 * @param newContents - The new content that is going to be added to the item.
 */
export async function calculateFinalSize(item: Item, newContents: Record<string, Blob>): Promise<number> {
  const newHashes = await computeHashes(newContents)
  const filesToDownload: Record<string, string> = {}
  for (const fileName in item.contents) {
    if (!newHashes[fileName] || item.contents[fileName] !== newHashes[fileName]) {
      filesToDownload[fileName] = item.contents[fileName]
    }
  }

  const blobs = await getFiles(filesToDownload)

  let imageSize = 0
  try {
    const image = await generateImage(item)
    imageSize = image.size
  } catch (error) {}

  const uniqueFiles = getUniqueFiles({ ...newHashes, ...filesToDownload }, { ...newContents, ...blobs })
  const finalSize = imageSize + calculateFilesSize(uniqueFiles)
  return finalSize
}

/**
 * Sums the sizes of an array of blobs.
 *
 * @param files - An array of blobs.
 */
function calculateFilesSize(files: Array<Blob>) {
  return files.reduce((total, blob) => blob.size + total, 0)
}
