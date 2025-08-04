import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { Authorization } from 'decentraland-dapps/dist/modules/authorization/types'
import { FetchCollectionsParams } from 'lib/api/builder'
import { Item } from 'modules/item/types'
import { Collection } from 'modules/collection/types'
import { ThirdParty } from 'modules/thirdParty/types'
import { fetchThirdPartyAvailableSlotsRequest, fetchThirdPartyRequest } from 'modules/thirdParty/actions'
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
  authorizations: Authorization[]
  lastLocation?: string
  isLoading: boolean
  isLoadingAvailableSlots: boolean
  isThirdPartyV2Enabled: boolean
  isLinkedWearablesPaymentsEnabled: boolean
  onNewItem: (collectionId: string) => unknown
  onEditName: (collection: Collection) => unknown
  onFetchThirdParty: ActionFunction<typeof fetchThirdPartyRequest>
  onFetchAvailableSlots: ActionFunction<typeof fetchThirdPartyAvailableSlotsRequest>
}

export type State = {
  selectedItems: Record<string, boolean>
  searchText: string
  page: number
  shouldFetchAllPages: boolean
  showSelectAllPages: boolean
  filters: Pick<FetchCollectionsParams, 'synced'>
}
