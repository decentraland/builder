import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'
import { setCollection, SetCollectionAction } from 'modules/item/actions'
import { Dispatch } from 'redux'

export type Props = {
  collection: Collection
  items: Item[]
  onSetCollection: typeof setCollection
}

export type MapStateProps = Pick<Props, 'items'>
export type MapDispatchProps = Pick<Props, 'onSetCollection'>
export type MapDispatch = Dispatch<SetCollectionAction>
export type OwnProps = Pick<Props, 'collection'>
