import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Collection } from 'modules/collection/types'
import { Item, SyncStatus } from 'modules/item/types'
import { LocationStateProps } from 'modules/location/types'
import { deleteItemRequest, DeleteItemRequestAction } from 'modules/item/actions'
import { openModal, OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'

export type Props = {
  collection: Collection
  item: Item
  selected: boolean
  status: SyncStatus
  onSelect: (item: Item, isSelected: boolean) => void
  onDelete: typeof deleteItemRequest
  onNavigate: (path: string, locationState?: LocationStateProps) => void
  onOpenModal: typeof openModal
}

export type MapStateProps = Pick<Props, 'status'>
export type MapDispatchProps = Pick<Props, 'onDelete' | 'onNavigate' | 'onOpenModal'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | DeleteItemRequestAction | OpenModalAction>
export type OwnProps = Pick<Props, 'item'>
