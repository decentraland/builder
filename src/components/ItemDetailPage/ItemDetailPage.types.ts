import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { deleteItemRequest, DeleteItemRequestAction } from 'modules/item/actions'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'

export type Props = {
  item: Item | null
  collection: Collection | null
  isLoading: boolean
  onNavigate: (path: string) => void
  onOpenModal: typeof openModal
  onDelete: typeof deleteItemRequest
}

export type MapStateProps = Pick<Props, 'item' | 'collection' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onDelete' | 'onOpenModal'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | DeleteItemRequestAction | OpenModalAction>
