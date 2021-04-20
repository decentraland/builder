import { Item } from 'modules/item/types'
import { Collection } from 'modules/collection/types'
import { ForumPost } from './types'
import { locations } from 'routing/locations'
import { getThumbnailURL } from 'modules/item/utils'

export function buildCollectionForumPost(collection: Collection, items: Item[]): ForumPost {
  const collectionURL = window.location.origin + locations.itemEditor({ collectionId: collection.id })

  // We only post in English
  return {
    title: `A new wearables collection created by ${collection.name} is ready for review!`,
    raw: `# ${collection.name}

  [View entire collection](${collectionURL})
    
  ## Wearables

  ${items.map(toRawItem).join('\n\n')}`
  }
}

function toRawItem(item: Item) {
  const sections = []
  if (item.description) {
    sections.push(`- Description: ${item.description}`)
  }
  if (item.rarity) {
    sections.push(`- Rarity: ${item.rarity}`)
  }
  if (item.data.category) {
    sections.push(`- Category: ${item.data.category}`)
  }
  return `**${item.name}**
${sections.join('\n')}
![](${getThumbnailURL(item)})
[Link to editor](${window.location.origin}${locations.itemEditor({ itemId: item.id })})`
}
