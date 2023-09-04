import { Item, ItemType } from 'modules/item/types'

export type Props = {
  item: Pick<Item<ItemType.EMOTE | ItemType.WEARABLE>, 'metrics' | 'contents'>
}
