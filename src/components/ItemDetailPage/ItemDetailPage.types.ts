import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { deleteItemRequest, DeleteItemRequestAction, saveItemRequest, SaveItemRequestAction } from 'modules/item/actions'
import { Collection } from 'modules/collection/types'
import { Item, SyncStatus } from 'modules/item/types'
import { openModal, OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'
import { LocationStateProps } from 'modules/location/types'

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
  onNavigate: (path: string, locationState?: LocationStateProps) => void
  onOpenModal: typeof openModal
  onDelete: typeof deleteItemRequest
  onSaveItem: typeof saveItemRequest
  hasAccess: boolean
}

export type MapStateProps = Pick<
  Props,
  'wallet' | 'itemId' | 'item' | 'collection' | 'status' | 'isLoading' | 'hasAccess' | 'isWearableUtilityEnabled'
>
export type MapDispatchProps = Pick<Props, 'onSaveItem' | 'onNavigate' | 'onDelete' | 'onOpenModal'>
export type MapDispatch = Dispatch<SaveItemRequestAction | CallHistoryMethodAction | DeleteItemRequestAction | OpenModalAction>
