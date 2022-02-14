import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { Authorization } from 'decentraland-dapps/dist/modules/authorization/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'
import { ThirdParty } from 'modules/thirdParty/types'
import { fetchItemCurationsRequest, FetchItemCurationsRequestAction } from 'modules/itemCuration/actions'
import { ItemCuration } from 'modules/itemCuration/types'

export type Props = {
  wallet: Wallet
  collection: Collection | null
  thirdParty: ThirdParty | null
  items: Item[]
  itemCurations: ItemCuration[]
  isOnSaleLoading: boolean
  authorizations: Authorization[]
  isLoading: boolean
  isLoadingItemCurations: boolean
  itemCurationsError: string | null
  onNavigate: (path: string) => void
  onOpenModal: typeof openModal
  onFetchItemCurations: typeof fetchItemCurationsRequest
}

export type State = {
  itemSelectionState: Record<string, boolean>
  searchText: string
  page: number
  isAuthModalOpen: boolean
}

export type MapStateProps = Pick<
  Props,
  | 'wallet'
  | 'collection'
  | 'items'
  | 'itemCurations'
  | 'thirdParty'
  | 'isLoading'
  | 'isLoadingItemCurations'
  | 'authorizations'
  | 'itemCurationsError'
>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onOpenModal' | 'onFetchItemCurations'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenModalAction | FetchItemCurationsRequestAction>
