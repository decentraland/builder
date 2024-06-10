import { Dispatch } from 'redux'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { deleteItemRequest, DeleteItemRequestAction, saveItemRequest, SaveItemRequestAction } from 'modules/item/actions'
import { Collection } from 'modules/collection/types'
import { Item, SyncStatus } from 'modules/item/types'
import { openModal, OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'

export type State = {
  thumbnail: string
  contents: Record<string, Blob>
}

export type Props = {
  itemId: string | null
  wallet: Wallet
  item: Item | null
  collection: Collection | null
  status: SyncStatus | null
  isLoading: boolean
  isWearableUtilityEnabled: boolean
  onOpenModal: typeof openModal
  onDelete: typeof deleteItemRequest
  onSaveItem: typeof saveItemRequest
  hasAccess: boolean
}

export type MapStateProps = Pick<
  Props,
  'wallet' | 'itemId' | 'item' | 'collection' | 'status' | 'isLoading' | 'hasAccess' | 'isWearableUtilityEnabled'
>
export type MapDispatchProps = Pick<Props, 'onSaveItem' | 'onDelete' | 'onOpenModal'>
export type MapDispatch = Dispatch<SaveItemRequestAction | DeleteItemRequestAction | OpenModalAction>
