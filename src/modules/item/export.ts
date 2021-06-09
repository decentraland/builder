import { AuthIdentity } from 'dcl-crypto'
import { ChainId } from '@dcl/schemas'
import { builder, getContentsStorageUrl } from 'lib/api/builder'
import { PEER_URL } from 'lib/api/peer'
import { getCatalystItemURN } from 'modules/item/utils'
import { buildDeployData, deploy, makeContentFiles, EntityType } from 'modules/deployment/contentUtils'
import { Collection } from 'modules/collection/types'
import { CatalystItem, Item, IMAGE_PATH, THUMBNAIL_PATH } from './types'
import { generateImage } from './utils'

export async function deployContents(identity: AuthIdentity, collection: Collection, item: Item, chainId: ChainId) {
  const urn = getCatalystItemURN(collection, item, chainId)
  const [files, image] = await Promise.all([getFiles(item.contents), generateImage(item)])
  const contentFiles = await makeContentFiles({ ...files, [IMAGE_PATH]: image })
  const catalystItem = toCatalystItem(collection, item, chainId)
  const [data] = await buildDeployData(EntityType.WEARABLE, identity, [urn], catalystItem, contentFiles)

  await deploy(PEER_URL, data)

  const newItem = { ...item, inCatalyst: true }
  if (!item.inCatalyst) {
    await builder.saveItem(newItem, {})
  }

  return newItem
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

export function calculateFilesSize(files: Record<string, Blob>) {
  return Object.values(files).reduce((total, blob) => blob.size + total, 0)
}
