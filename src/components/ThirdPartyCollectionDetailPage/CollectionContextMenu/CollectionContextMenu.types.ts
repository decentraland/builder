import { Dispatch } from 'redux'
import { deleteCollectionRequest, DeleteCollectionRequestAction } from 'modules/collection/actions'
import { openModal, OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'

export type Props = {
  collection: Collection
  items: Item[]
  name: string
  onOpenModal: typeof openModal
  onDelete: typeof deleteCollectionRequest
}

export type OwnProps = Pick<Props, 'collection' | 'items'>
export type MapStateProps = Pick<Props, 'name'>
export type MapDispatchProps = Pick<Props, 'onOpenModal' | 'onDelete'>
export type MapDispatch = Dispatch<OpenModalAction | DeleteCollectionRequestAction>
