import { AuthIdentity } from 'dcl-crypto'
import { builder, getContentsStorageUrl } from 'lib/api/builder'
import { PEER_URL } from 'lib/api/peer'
import { getCatalystPointer } from 'modules/item/utils'
import { buildDeployData, deploy, makeContentFiles, EntityType } from 'modules/deployment/contentUtils'
import { Collection } from 'modules/collection/types'
import { CatalystItem, Item, IMAGE_PATH, THUMBNAIL_PATH } from './types'
import { generateImage } from './utils'

export async function deployContents(identity: AuthIdentity, collection: Collection, item: Item) {
  const pointer = getCatalystPointer(collection, item)
  const files = await getFiles(item.contents)
  const image = await generateImage(item)
  const contentFiles = await makeContentFiles({ ...files, [IMAGE_PATH]: image })
  const [data] = await buildDeployData(EntityType.WEARABLE, identity, [pointer], toCatalystItem(collection, item), contentFiles)
  await deploy(PEER_URL, data)

  // @TODO: Revisit this because if it is in the catalyst we shouldn't update it
  const newItem = { ...item, inCatalyst: true }
  if (!item.isPublished) {
    await builder.saveItem(newItem, {})
  }

  return newItem
}

async function getFiles(contents: Record<string, string>) {
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

function toCatalystItem(collection: Collection, item: Item): CatalystItem {
  return {
    id: item.tokenId!,
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
    metrics: item.metrics,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
}
