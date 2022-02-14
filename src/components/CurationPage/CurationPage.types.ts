import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { Collection } from 'modules/collection/types'
import { fetchCollectionsRequest } from 'modules/collection/actions'
import { fetchItemsRequest } from 'modules/item/actions'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'

export enum SortBy {
  NEWEST = 'NEWEST',
  NAME_DESC = 'NAME_DESC',
  NAME_ASC = 'NAME_ASC'
}

export enum FilterBy {
  ALL_STATUS = 'ALL_STATUS',
  APPROVED = 'APPROVED',
  NOT_REVIWED = 'NOT_REVIEWED',
  REJECTED = 'REJECTED'
}

export type Props = {
  wallet: Wallet
  collections: Collection[]
  curationsByCollectionId: Record<string, CollectionCuration>
  isCommitteeMember: boolean
  isConnecting: boolean
  isLoading: boolean
  onNavigate: (path: string) => void
  onFetchCollections: typeof fetchCollectionsRequest
  onFetchItems: typeof fetchItemsRequest
}

export type State = {
  page: number
  sortBy: SortBy
  filterBy: FilterBy
  searchText: string
}

export type MapStateProps = Pick<Props, 'wallet' | 'collections' | 'curationsByCollectionId' | 'isCommitteeMember' | 'isConnecting' | 'isLoading'>
