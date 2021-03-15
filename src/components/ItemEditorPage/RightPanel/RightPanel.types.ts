import { Dispatch } from 'redux'
import {
  deleteItemRequest,
  DeleteItemRequestAction,
  saveItemRequest,
  SaveItemRequestAction,
  savePublishedItemRequest,
  SavePublishedItemRequestAction,
  setCollection,
  SetCollectionAction
} from 'modules/item/actions'
import { Item } from 'modules/item/types'
import { Collection } from 'modules/collection/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'

export type Props = {
  address?: string
  collection: Collection | null
  items: Item[]
  selectedItemId: string | null
  onSaveItem: typeof saveItemRequest
  onSaveItemPublished: typeof savePublishedItemRequest
  onDeleteItem: typeof deleteItemRequest
  onOpenModal: typeof openModal
  onSetCollection: typeof setCollection
}

export type State = {
  item: Item | null
  isDirty: boolean
}

export type MapStateProps = Pick<Props, 'address' | 'collection' | 'items' | 'selectedItemId'>
export type MapDispatchProps = Pick<Props, 'onSaveItem' | 'onSaveItemPublished' | 'onDeleteItem' | 'onOpenModal' | 'onSetCollection'>
export type MapDispatch = Dispatch<
  SaveItemRequestAction | SavePublishedItemRequestAction | DeleteItemRequestAction | OpenModalAction | SetCollectionAction
>
