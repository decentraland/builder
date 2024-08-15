import { Dispatch } from 'redux'
import { Collection } from 'modules/collection/types'
import { SetCollectionAction } from 'modules/item/actions'
import { DeleteCollectionRequestAction } from 'modules/collection/actions'

export type Props = {
  collection: Collection
  itemCount: number
  onDeleteCollection: () => ReturnType<Dispatch<DeleteCollectionRequestAction>>
}

export type MapStateProps = Pick<Props, 'itemCount'>
export type MapDispatchProps = Pick<Props, 'onDeleteCollection'>
export type MapDispatch = Dispatch<SetCollectionAction | DeleteCollectionRequestAction>
export type OwnProps = Pick<Props, 'collection'>
