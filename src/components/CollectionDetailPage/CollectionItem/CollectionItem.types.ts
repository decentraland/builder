import { Dispatch } from 'redux'
import { Collection } from 'modules/collection/types'
import { Item, SyncStatus } from 'modules/item/types'
import { openModal, OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'
import { CancelItemOrderTradeRequestAction, deleteItemRequest, DeleteItemRequestAction } from 'modules/item/actions'
import { setItems, SetItemsAction } from 'modules/editor/actions'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet'
import { Variant } from 'decentraland-dapps/dist/modules/features/types'

export type Props = {
  ethAddress?: string
  collection: Collection
  item: Item
  status: SyncStatus
  isOffchainPublicItemOrdersEnabled: boolean
  isOffchainPublicItemOrdersEnabledVariants: Variant | null
  wallet: Wallet | null
  isCancellingItemOrder: boolean
  loadingTradeIds: string[]
  onOpenModal: typeof openModal
  onDeleteItem: typeof deleteItemRequest
  onSetItems: typeof setItems
  onRemoveFromSale: (tradeId: string) => void
}

export type MapStateProps = Pick<
  Props,
  | 'ethAddress'
  | 'status'
  | 'isOffchainPublicItemOrdersEnabled'
  | 'isOffchainPublicItemOrdersEnabledVariants'
  | 'wallet'
  | 'isCancellingItemOrder'
  | 'loadingTradeIds'
>
export type MapDispatchProps = Pick<Props, 'onOpenModal' | 'onDeleteItem' | 'onSetItems' | 'onRemoveFromSale'>
export type MapDispatch = Dispatch<OpenModalAction | DeleteItemRequestAction | SetItemsAction | CancelItemOrderTradeRequestAction>
export type OwnProps = Pick<Props, 'item'>
