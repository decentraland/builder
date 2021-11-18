import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'
import { deleteItemRequest, DeleteItemRequestAction } from 'modules/item/actions'
import { openModal, OpenModalAction } from 'modules/modal/actions'

export type Props = {
  collection: Collection
  item: Item
  selected: boolean
  onSelect: (item: Item, isSelected: boolean) => void
  onDelete: typeof deleteItemRequest
  onNavigate: (path: string) => void
  onOpenModal: typeof openModal
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onDelete' | 'onNavigate' | 'onOpenModal'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | DeleteItemRequestAction | OpenModalAction>
