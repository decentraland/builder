import { Authenticator, AuthIdentity } from 'dcl-crypto'
import { ChainId } from '@dcl/schemas'
import { CatalystClient } from 'dcl-catalyst-client'
import { EntityType } from 'dcl-catalyst-commons'
import { getContentsStorageUrl } from 'lib/api/builder'
import { PEER_URL } from 'lib/api/peer'
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
      representations: item.data.representations,
      category: item.data.category
    },
    image: IMAGE_PATH,
    thumbnail: THUMBNAIL_PATH,
    contents: item.contents,
    metrics: item.metrics,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
}

export async function getFiles(contents: Record<string, string>) {
  const promises = Object.keys(contents).map(path => {
    const url = getContentsStorageUrl(contents[path])

    return fetch(url)
      .then(resp => resp.blob())
      .then(blob => ({ path, blob }))
  })

  const results = await Promise.all(promises)

  return results.reduce<Record<string, Blob>>((files, file) => {
    files[file.path] = file.blob
    return files
  }, {})
}

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

  const finalSize = imageSize + calculateFilesSize(blobs) + calculateFilesSize(newContents)
  return finalSize
}

export function calculateFilesSize(files: Record<string, Blob>) {
  return Object.values(files).reduce((total, blob) => blob.size + total, 0)
}
