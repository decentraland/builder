import { Dispatch } from 'redux'
import { Collection } from 'modules/collection/types'
import { Item, SyncStatus } from 'modules/item/types'
import { deleteItemRequest, DeleteItemRequestAction, SaveItemRequestAction } from 'modules/item/actions'
import { openModal, OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'

export type Props = {
  collection: Collection
  item: Item
  selected: boolean
  status: SyncStatus
  loading?: boolean
  onSelect: (item: Item, isSelected: boolean) => void
  onSaveItem: (item: Item) => unknown
  onDelete: typeof deleteItemRequest
  onOpenModal: typeof openModal
}

export type MapStateProps = Pick<Props, 'status' | 'loading'>
export type MapDispatchProps = Pick<Props, 'onDelete' | 'onOpenModal' | 'onSaveItem'>
export type MapDispatch = Dispatch<DeleteItemRequestAction | OpenModalAction | SaveItemRequestAction>
export type OwnProps = Pick<Props, 'item' | 'collection'>
