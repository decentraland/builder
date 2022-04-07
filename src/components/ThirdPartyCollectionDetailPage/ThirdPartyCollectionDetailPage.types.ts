import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { Authorization } from 'decentraland-dapps/dist/modules/authorization/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { Item } from 'modules/item/types'
import { Collection } from 'modules/collection/types'
import { ThirdParty } from 'modules/thirdParty/types'
import { FetchItemCurationsRequestAction } from 'modules/curations/itemCuration/actions'
import { ItemCuration } from 'modules/curations/itemCuration/types'
import { fetchThirdPartyAvailableSlotsRequest, FetchThirdPartyAvailableSlotsRequestAction } from 'modules/thirdParty/actions'
import { FetchCollectionItemsRequestAction } from 'modules/item/actions'
import { ItemPaginationData } from 'modules/item/reducer'

export const PAGE_SIZE = 50

export type Props = {
  wallet: Wallet
  collection: Collection | null
  thirdParty: ThirdParty | null
  totalItems: number | null
  currentPage: number
  paginatedData: ItemPaginationData | null
  items: Item[]
  itemCurations: ItemCuration[]
  isOnSaleLoading: boolean
  authorizations: Authorization[]
  isLoading: boolean
  isLoadingAvailableSlots: boolean
  onNavigate: (path: string) => void
  onOpenModal: typeof openModal
  onFetchAvailableSlots: typeof fetchThirdPartyAvailableSlotsRequest
  onPageChange: (collectionId: string, page: number) => void
}

export type State = {
  selectedItems: Record<string, boolean>
  searchText: string
  page: number
  shouldFetchAllPages: boolean
  isAuthModalOpen: boolean
  showSelectAllPages: boolean
}

export type MapStateProps = Pick<
  Props,
  | 'wallet'
  | 'collection'
  | 'thirdParty'
  | 'isLoading'
  | 'isLoadingAvailableSlots'
  | 'authorizations'
  | 'currentPage'
  | 'totalItems'
  | 'items'
  | 'paginatedData'
>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onOpenModal' | 'onFetchAvailableSlots' | 'onPageChange'>
export type MapDispatch = Dispatch<
  | CallHistoryMethodAction
  | OpenModalAction
  | FetchItemCurationsRequestAction
  | FetchThirdPartyAvailableSlotsRequestAction
  | FetchCollectionItemsRequestAction
>
