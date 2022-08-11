import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { Collection } from 'modules/collection/types'
import { Item, ItemType } from 'modules/item/types'

export type Props = {
  tab?: ItemType
  wallet: Wallet
  collection: Collection | null
  isOnSaleLoading: boolean
  isLoading: boolean
  items: Item[]
  onNavigate: (path: string) => void
  onOpenModal: typeof openModal
}

export type State = {
  tab: ItemType
}

export type MapStateProps = Pick<Props, 'wallet' | 'collection' | 'isOnSaleLoading' | 'isLoading' | 'items' | 'tab'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onOpenModal'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenModalAction>
