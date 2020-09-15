import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'

export type Props = {
  collection: Collection
  items: Item[]
  isLoading: boolean
}

export type MapStateProps = Pick<Props, 'items' | 'isLoading'>
export type OwnProps = Pick<Props, 'collection'>
