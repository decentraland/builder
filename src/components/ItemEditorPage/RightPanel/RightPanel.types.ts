import { Dispatch } from 'redux'
import { deleteItemRequest, DeleteItemRequestAction, saveItemRequest, SaveItemRequestAction, setCollection, SetCollectionAction } from 'modules/item/actions'
import { Item } from 'modules/item/types'
import { Collection } from 'modules/collection/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'

export type Props = {
  address?: string
  collection: Collection | null,
  items: Item[]
  selectedItemId: string | null
  onSaveItem: typeof saveItemRequest
  onDeleteItem: typeof deleteItemRequest
  onOpenModal: typeof openModal
  onSetCollection: typeof setCollection
}

export type MapStateProps = Pick<Props, 'address' | 'collection' | 'items' | 'selectedItemId'>
export type MapDispatchProps = Pick<Props, 'onSaveItem' | 'onDeleteItem' | 'onOpenModal' | 'onSetCollection'>
export type MapDispatch = Dispatch<SaveItemRequestAction | DeleteItemRequestAction | OpenModalAction | SetCollectionAction>
