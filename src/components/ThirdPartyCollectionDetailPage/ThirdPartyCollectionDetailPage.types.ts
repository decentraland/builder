import { Dispatch } from 'redux'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { Authorization } from 'decentraland-dapps/dist/modules/authorization/types'
import { FetchCollectionsParams } from 'lib/api/builder'
import { openModal, OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'
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
  lastLocation?: string
  isLoading: boolean
  isLoadingAvailableSlots: boolean
  isThirdPartyV2Enabled: boolean
  onOpenModal: typeof openModal
  onFetchAvailableSlots: typeof fetchThirdPartyAvailableSlotsRequest
}

export type State = {
  selectedItems: Record<string, boolean>
  searchText: string
  page: number
  shouldFetchAllPages: boolean
  showSelectAllPages: boolean
  filters: Pick<FetchCollectionsParams, 'synced'>
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
  | 'isThirdPartyV2Enabled'
  | 'paginatedData'
  | 'lastLocation'
>
export type MapDispatchProps = Pick<Props, 'onOpenModal' | 'onFetchAvailableSlots'>
export type MapDispatch = Dispatch<
  OpenModalAction | FetchItemCurationsRequestAction | FetchThirdPartyAvailableSlotsRequestAction | FetchCollectionItemsRequestAction
>
