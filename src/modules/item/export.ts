import { Authenticator, AuthIdentity } from 'dcl-crypto'
import { CatalystClient, DeploymentPreparationData } from 'dcl-catalyst-client'
import { EntityContentItemReference, EntityMetadata, EntityType, Hashing } from 'dcl-catalyst-commons'
import { getContentsStorageUrl } from 'lib/api/builder'
import { PEER_URL } from 'lib/api/peer'
import { NO_CACHE_HEADERS } from 'lib/headers'
import { buildCatalystItemURN, buildThirdPartyURN, extractThirdPartyId } from 'lib/urn'
import { isTPCollection } from 'modules/collection/utils'
import { makeContentFiles, computeHashes } from 'modules/deployment/contentUtils'
import { Collection } from 'modules/collection/types'
import { CatalystItem, Item, IMAGE_PATH, THUMBNAIL_PATH, CatalystTPItem } from './types'
import { generateCatalystImage, generateImage } from './utils'

export async function deployContents(identity: AuthIdentity, collection: Collection, item: Item) {
  const client = new CatalystClient(PEER_URL, 'Builder')
  const entity = await buildItemEntity(client, collection, item)
  const authChain = Authenticator.signPayload(identity, entity.entityId)

  await client.deployEntity({ ...entity, authChain })

  return { ...item, inCatalyst: true }
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
 * All the files in newContents must also be in the item's contents in both name and hash.
 *
 * @param item - An item that contains the old and the new hashed content.
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

function buildItemEntityMetadata(collection: Collection, item: Item): CatalystItem | CatalystTPItem {
  const isTP = isTPCollection(collection)
  if (isTP && (!collection.contractAddress || !item.tokenId)) {
    throw new Error('You need the collection and item to be published')
  }

  const baseEntityProps = {
    name: item.name,
    description: item.description,
    i18n: [{ code: 'en', text: item.name }],
    data: item.data,
    image: IMAGE_PATH,
    thumbnail: THUMBNAIL_PATH,
    metrics: item.metrics
  }

  return isTP
    ? { ...baseEntityProps, id: buildThirdPartyURN(extractThirdPartyId(collection.urn), collection.id, item.id) }
    : {
        id: buildCatalystItemURN(collection.contractAddress!, item.tokenId!),
        rarity: item.rarity,
        collectionAddress: collection.contractAddress!,
        ...baseEntityProps
      }
}

async function buildItemEntityContent(item: Item): Promise<Record<string, string>> {
  const contents = { ...item.contents }
  if (!item.contents[IMAGE_PATH]) {
    const catalystItem = await generateCatalystImage(item)
    contents[IMAGE_PATH] = catalystItem.hash
  }

  return contents
}

async function buildItemEntityBlobs(item: Item): Promise<Record<string, Blob>> {
  const [files, image] = await Promise.all([getFiles(item.contents), !item.contents[IMAGE_PATH] ? generateImage(item) : null])
  files[IMAGE_PATH] = image ?? files[IMAGE_PATH]
  return files
}

export async function buildItemEntity(client: CatalystClient, collection: Collection, item: Item): Promise<DeploymentPreparationData> {
  const blobs = await buildItemEntityBlobs(item)
  const files = await makeContentFiles(blobs)
  const metadata = buildItemEntityMetadata(collection, item)
  return client.buildEntity({
    type: EntityType.WEARABLE,
    pointers: [metadata.id],
    metadata,
    files,
    timestamp: Date.now()
  })
}

export async function buildItemContentHash(collection: Collection, item: Item): Promise<string> {
  const hashes = await buildItemEntityContent(item)
  const content = Object.keys(hashes).map(file => ({ file, hash: hashes[file] }))
  const metadata = buildItemEntityMetadata(collection, item)
  return calculateContentHash(content, metadata)
}

async function calculateContentHash(content: EntityContentItemReference[], metadata: EntityMetadata) {
  const data = JSON.stringify({
    content: content
      .sort((a: EntityContentItemReference, b: EntityContentItemReference) => {
        if (a.hash > b.hash) return 1
        else if (a.hash < b.hash) return -1
        else return a.file > b.file ? 1 : -1
      })
      .map(entry => ({ key: entry.file, hash: entry.hash })),
    metadata
  })
  const buffer = Buffer.from(data)
  return Hashing.calculateBufferHash(buffer)
}
