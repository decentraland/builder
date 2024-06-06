import { Dispatch } from 'redux'
import { Collection } from 'modules/collection/types'
import { Item, SyncStatus } from 'modules/item/types'
import { deleteItemRequest, DeleteItemRequestAction } from 'modules/item/actions'
import { openModal, OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'

export type Props = {
  collection: Collection
  item: Item
  selected: boolean
  status: SyncStatus
  onSelect: (item: Item, isSelected: boolean) => void
  onDelete: typeof deleteItemRequest
  onOpenModal: typeof openModal
}

export type MapStateProps = Pick<Props, 'status'>
export type MapDispatchProps = Pick<Props, 'onDelete' | 'onOpenModal'>
export type MapDispatch = Dispatch<DeleteItemRequestAction | OpenModalAction>
export type OwnProps = Pick<Props, 'item'>
