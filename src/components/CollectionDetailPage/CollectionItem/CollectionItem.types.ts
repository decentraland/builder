import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Collection } from 'modules/collection/types'
import { Item, SyncStatus } from 'modules/item/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { deleteItemRequest, DeleteItemRequestAction } from 'modules/item/actions'
import { setItems, SetItemsAction } from 'modules/editor/actions'
import { LocationStateProps } from 'modules/location/types'

export type Props = {
  ethAddress?: string
  collection: Collection
  item: Item
  status: SyncStatus
  onNavigate: (path: string, locationState?: LocationStateProps) => void
  onOpenModal: typeof openModal
  onDeleteItem: typeof deleteItemRequest
  onSetItems: typeof setItems
}

export type MapStateProps = Pick<Props, 'ethAddress' | 'status'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onOpenModal' | 'onDeleteItem' | 'onSetItems'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenModalAction | DeleteItemRequestAction | SetItemsAction>
export type OwnProps = Pick<Props, 'item'>
