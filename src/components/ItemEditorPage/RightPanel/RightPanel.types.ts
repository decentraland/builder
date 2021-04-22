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
import { Item, ItemRarity, WearableData } from 'modules/item/types'
import { Collection } from 'modules/collection/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'

export type Props = {
  address?: string
  collection: Collection | null
  selectedItem: Item | null
  selectedItemId: string | null
  onSaveItem: typeof saveItemRequest
  onSavePublishedItem: typeof savePublishedItemRequest
  onDeleteItem: typeof deleteItemRequest
  onOpenModal: typeof openModal
  onSetCollection: typeof setCollection
}

export type State = {
  name: string
  description: string
  thumbnail: string
  rarity?: ItemRarity
  contents: Record<string, Blob>
  data?: WearableData
  hasItem: boolean
  isDirty: boolean
}

export type MapStateProps = Pick<Props, 'address' | 'collection' | 'selectedItem' | 'selectedItemId'>
export type MapDispatchProps = Pick<Props, 'onSaveItem' | 'onSavePublishedItem' | 'onDeleteItem' | 'onOpenModal' | 'onSetCollection'>
export type MapDispatch = Dispatch<
  SaveItemRequestAction | SavePublishedItemRequestAction | DeleteItemRequestAction | OpenModalAction | SetCollectionAction
>
