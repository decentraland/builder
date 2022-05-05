import { Dispatch } from 'redux'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { FetchCollectionsParams } from 'lib/api/builder'
import { FetchCollectionsRequestAction } from 'modules/collection/actions'
import { CollectionPaginationData } from 'modules/collection/reducer'
import { CurationSortOptions, CurationStatus } from 'modules/curations/types'
import { Collection } from 'modules/collection/types'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'

export enum CurationExtraStatuses {
  ALL_STATUS = 'ALL_STATUS'
}

export const CurationFilterOptions = { ...CurationStatus, ...CurationExtraStatuses }

export type Filters = CurationStatus | CurationExtraStatuses

export type Props = {
  wallet: Wallet
  collections: Collection[]
  paginationData: CollectionPaginationData | null
  curationsByCollectionId: Record<string, CollectionCuration>
  isCommitteeMember: boolean
  committeeMembers: string[]
  isConnecting: boolean
  isLoadingCollectionsData: boolean
  isLoadingCommittee: boolean
  onNavigate: (path: string) => void
  onFetchCollections: (params?: FetchCollectionsParams) => ReturnType<Dispatch<FetchCollectionsRequestAction>>
}

export type State = {
  page: number
  sortBy: CurationSortOptions
  filterBy: Filters
  assignee: string
  searchText: string
}

export type MapStateProps = Pick<
  Props,
  | 'wallet'
  | 'collections'
  | 'paginationData'
  | 'curationsByCollectionId'
  | 'isCommitteeMember'
  | 'committeeMembers'
  | 'isConnecting'
  | 'isLoadingCollectionsData'
  | 'isLoadingCommittee'
>

export type MapDispatchProps = Pick<Props, 'onFetchCollections'>
export type MapDispatch = Dispatch<FetchCollectionsRequestAction>
