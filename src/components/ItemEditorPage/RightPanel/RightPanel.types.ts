import { Dispatch } from 'redux'
import { deleteItemRequest, DeleteItemRequestAction, saveItemRequest, SaveItemRequestAction, setCollection, SetCollectionAction } from 'modules/item/actions'
import { Item } from 'modules/item/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'

export type Props = {
  address?: string
  items: Item[]
  selectedItemId: string | null
  onSaveItem: typeof saveItemRequest
  onDeleteItem: typeof deleteItemRequest
  onOpenModal: typeof openModal
  onSetCollection: typeof setCollection
}

export type MapStateProps = Pick<Props, 'address' | 'items' | 'selectedItemId'>
export type MapDispatchProps = Pick<Props, 'onSaveItem' | 'onDeleteItem' | 'onOpenModal' | 'onSetCollection'>
export type MapDispatch = Dispatch<SaveItemRequestAction | DeleteItemRequestAction | OpenModalAction | SetCollectionAction>
