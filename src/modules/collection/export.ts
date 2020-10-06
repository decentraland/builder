import { utils } from 'decentraland-commons'
import { AuthIdentity } from 'dcl-crypto'
import { getContentsStorageUrl } from 'lib/api/builder'
import { saveItem } from 'modules/item/sagas'
import { Item } from 'modules/item/types'
import { getCatalystEntityId } from 'modules/item/utils'
import { buildDeployData, deploy, makeContentFiles, EntityType } from 'modules/deployment/contentUtils'
import { PEER_URL } from 'lib/api/peer'
import { Collection } from './types'

export async function deployItemContents(identity: AuthIdentity, collection: Collection, items: Item[]) {
  const deploys = []
  for (const item of items) {
    if (item.inCatalyst) continue

    const pointer = getCatalystEntityId(collection, item)
    const files = await getFiles(item.contents)
    const contentFiles = await makeContentFiles(files)
    const metadata = utils.omit(item, ['contents'])
    const [data] = await buildDeployData(EntityType.WEARABLE, identity, [pointer], metadata, contentFiles)

    const deployItem = deploy(PEER_URL, data).then(() => saveItem({ ...item, inCatalyst: true }))
    deploys.push(deployItem)
  }
  return Promise.all(deploys)
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
