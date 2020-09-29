import { Dispatch } from 'redux'
import { deleteItemRequest, DeleteItemRequestAction, saveItemRequest, SaveItemRequestAction } from 'modules/item/actions'
import { Item } from 'modules/item/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'

export type Props = {
  selectedItemId: string | null
  items: Item[]
  onSaveItem: typeof saveItemRequest
  onDeleteItem: typeof deleteItemRequest
  onOpenModal: typeof openModal
}

export type MapStateProps = Pick<Props, 'items' | 'selectedItemId'>
export type MapDispatchProps = Pick<Props, 'onSaveItem' | 'onDeleteItem' | 'onOpenModal'>
export type MapDispatch = Dispatch<SaveItemRequestAction | DeleteItemRequestAction | OpenModalAction>
