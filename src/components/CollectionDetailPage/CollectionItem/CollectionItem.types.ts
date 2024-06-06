import { Dispatch } from 'redux'
import { Collection } from 'modules/collection/types'
import { Item, SyncStatus } from 'modules/item/types'
import { openModal, OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'
import { deleteItemRequest, DeleteItemRequestAction } from 'modules/item/actions'
import { setItems, SetItemsAction } from 'modules/editor/actions'

export type Props = {
  ethAddress?: string
  collection: Collection
  item: Item
  status: SyncStatus
  onOpenModal: typeof openModal
  onDeleteItem: typeof deleteItemRequest
  onSetItems: typeof setItems
}

export type MapStateProps = Pick<Props, 'ethAddress' | 'status'>
export type MapDispatchProps = Pick<Props, 'onOpenModal' | 'onDeleteItem' | 'onSetItems'>
export type MapDispatch = Dispatch<OpenModalAction | DeleteItemRequestAction | SetItemsAction>
export type OwnProps = Pick<Props, 'item'>
