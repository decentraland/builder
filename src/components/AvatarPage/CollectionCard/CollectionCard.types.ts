import { Collection } from 'modules/collection/types'
import { setCollection, SetCollectionAction } from 'modules/item/actions'
import { Dispatch } from 'redux'

export type Props = {
  collection: Collection
  onSetCollection: typeof setCollection
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onSetCollection'>
export type MapDispatch = Dispatch<SetCollectionAction>
export type OwnProps = Pick<Props, 'collection'>
