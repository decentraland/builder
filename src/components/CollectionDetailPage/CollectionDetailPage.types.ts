import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { Collection } from 'modules/collection/types'
import { Item, ItemType, SyncStatus } from 'modules/item/types'

export type Props = {
  tab?: ItemType
  wallet: Wallet
  collection: Collection | null
  isOnSaleLoading: boolean
  isLoading: boolean
  items: Item[]
  status: SyncStatus
  onNavigate: (path: string, prop?: CollectionDetailRouterProps) => void
  onOpenModal: typeof openModal
}

export type CollectionDetailRouterProps = {
  fromParam?: string
}

export type State = {
  tab: ItemType
}

export type MapStateProps = Pick<Props, 'wallet' | 'collection' | 'isOnSaleLoading' | 'isLoading' | 'items' | 'tab' | 'status'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onOpenModal'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenModalAction>
