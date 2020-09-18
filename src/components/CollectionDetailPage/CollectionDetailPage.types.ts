import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import {
  deleteCollectionRequest,
  DeleteCollectionRequestAction,
  setCollectionMintersRequest,
  SetCollectionMintersRequestAction
} from 'modules/collection/actions'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'

export type Props = {
  collection: Collection | null
  items: Item[]
  isOnSaleLoading: boolean
  isLoading: boolean
  onNavigate: (path: string) => void
  onOpenModal: typeof openModal
  onDelete: typeof deleteCollectionRequest
  onSetMinters: typeof setCollectionMintersRequest
}

export type MapStateProps = Pick<Props, 'collection' | 'items' | 'isOnSaleLoading' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onOpenModal' | 'onDelete' | 'onSetMinters'>
export type MapDispatch = Dispatch<
  CallHistoryMethodAction | OpenModalAction | DeleteCollectionRequestAction | SetCollectionMintersRequestAction
>
