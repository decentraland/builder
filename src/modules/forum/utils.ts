import { Item } from 'modules/item/types'
import { Collection } from 'modules/collection/types'
import { ForumPost } from './types'
import { locations } from 'routing/locations'
import { getThumbnailURL } from 'modules/item/utils'

export function buildCollectionForumPost(collection: Collection, items: Item[]): ForumPost {
  const collectionURL = window.location.origin + locations.itemEditor({ collectionId: collection.id })
  const itemImageURLs = items.map(item => `![](${getThumbnailURL(item)})`)

  // We only post in English
  return {
    title: `Review collection: "${collection.name}"`,
    raw: `Collection can be found at ${collectionURL}.\nItems:\n${itemImageURLs.join('\n')}`
  }
}
