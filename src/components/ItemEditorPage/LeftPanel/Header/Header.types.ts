import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Collection } from 'modules/collection/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { deleteCollectionRequest, DeleteCollectionRequestAction } from 'modules/collection/actions'
import { deleteItemRequest, DeleteItemRequestAction } from 'modules/item/actions'

export type Props = {
  collection?: Collection
  onOpenModal: typeof openModal
  onNavigate: (path: string) => void
  onDeleteCollection: typeof deleteCollectionRequest
  onDeleteItem: typeof deleteItemRequest
}

export type MapStateProps = Pick<Props, 'collection'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onOpenModal' | 'onDeleteCollection' | 'onDeleteItem'>
export type MapDispatch = Dispatch<OpenModalAction | CallHistoryMethodAction | DeleteCollectionRequestAction | DeleteItemRequestAction>
