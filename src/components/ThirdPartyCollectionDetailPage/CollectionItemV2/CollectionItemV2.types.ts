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

// This is an extension of src/modules/item/types.ts
export enum ItemStatus {
  UNPUBLISHED = 'unpublished', // contract not deployed yet
  UNDER_REVIEW = 'under_review', // contract deployed, but not approved yet
  LOADING = 'loading', // contract deployed and approved, but entitiy not loaded yet from catalyst
  UNSYNCED = 'unsynced', // contract deployed and approved, but contents in catalyst (entity) are different from contents on builder (item)
  SYNCED = 'synced', // contract deployed and approved, and contents in catalyst === contents on builder
  PENDING_MIGRATION = 'pending_migration', // the item has local mappings but no published ones
  PENDING_MAPPING = 'pending_mapping' // the item has mappings but they are not complete
}
