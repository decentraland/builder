import { Dispatch } from 'redux'
import {
  deleteItemRequest,
  DeleteItemRequestAction,
  saveItemRequest,
  SaveItemRequestAction,
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
  error: string | null
  isConnected: boolean
  onSaveItem: typeof saveItemRequest
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

export type MapStateProps = Pick<Props, 'address' | 'collection' | 'selectedItem' | 'selectedItemId' | 'error' | 'isConnected'>
export type MapDispatchProps = Pick<Props, 'onSaveItem' | 'onDeleteItem' | 'onOpenModal' | 'onSetCollection'>
export type MapDispatch = Dispatch<SaveItemRequestAction | DeleteItemRequestAction | OpenModalAction | SetCollectionAction>
