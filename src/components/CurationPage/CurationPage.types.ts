import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { Collection } from 'modules/collection/types'
import { fetchCollectionsRequest } from 'modules/collection/actions'
import { fetchItemsRequest } from 'modules/item/actions'

export enum SortBy {
  NEWEST = 'NEWEST',
  NAME_DESC = 'NAME_DESC',
  NAME_ASC = 'NAME_ASC'
}

export enum FilterBy {
  ALL_STATUS = 'ALL_STATUS',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export type Props = {
  wallet: Wallet
  collections: Collection[]
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
}

export type MapStateProps = Pick<Props, 'wallet' | 'collections' | 'isCommitteeMember' | 'isConnecting' | 'isLoading'>
