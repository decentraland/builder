import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Item } from 'modules/item/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { deleteItemRequest, DeleteItemRequestAction, setCollection, SetCollectionAction } from 'modules/item/actions'

export type Props = {
  item: Item
  onNavigate: (path: string) => void
  onOpenModal: typeof openModal
  onRemoveFromCollection: typeof setCollection
  onDelete: typeof deleteItemRequest
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onOpenModal' | 'onDelete' | 'onRemoveFromCollection'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenModalAction | DeleteItemRequestAction | SetCollectionAction>
