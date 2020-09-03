import { Item, WearableData } from 'modules/item/types'

export function isComplete(item: Item) {
  return !isEditable(item) && !!item.beneficiary && !!item.price
}

export function isEditable(item: Item) {
  const data = item.data as WearableData
  return !item.rarity || !data.category
}
