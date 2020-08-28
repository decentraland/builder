import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'

export type Props = {
  collection: Collection
  items: Item[]
}

export type MapStateProps = Pick<Props, 'items'>
export type OwnProps = Pick<Props, 'collection'>
