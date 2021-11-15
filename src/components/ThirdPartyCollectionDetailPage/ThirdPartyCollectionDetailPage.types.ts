import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'
import { ThirdParty } from 'modules/thirdParty/types'

export type Props = {
  wallet: Wallet
  collection: Collection | null
  items: Item[]
  isOnSaleLoading: boolean
  isLoading: boolean
  thirdParty: ThirdParty | null
  onNavigate: (path: string) => void
  onOpenModal: typeof openModal
}

export type MapStateProps = Pick<Props, 'wallet' | 'collection' | 'items' | 'isLoading' | 'thirdParty'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onOpenModal'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenModalAction>
