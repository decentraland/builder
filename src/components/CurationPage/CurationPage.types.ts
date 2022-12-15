import { Dispatch } from 'redux'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { FetchCollectionsParams } from 'lib/api/builder'
import { FetchCollectionsRequestAction } from 'modules/collection/actions'
import { CollectionPaginationData } from 'modules/collection/reducer'
import { CurationSortOptions, CurationStatus } from 'modules/curations/types'
import { Collection, CollectionType } from 'modules/collection/types'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'

export enum CurationExtraStatuses {
  ALL_STATUS = 'ALL_STATUS'
}

export enum CollectionExtraTypes {
  ALL_TYPES = 'ALL_TYPES'
}

export const CurationFilterOptions = { ...CurationStatus, ...CurationExtraStatuses }

export const CollectionFilterOptions = { ...CollectionType, ...CollectionExtraTypes }

export type CurationStatuses = CurationStatus | CurationExtraStatuses

export type CollectionTypes = CollectionType | CollectionExtraTypes

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
  isMVMFEnabled: boolean
  onNavigate: (path: string) => void
  onFetchCollections: (params?: FetchCollectionsParams) => ReturnType<Dispatch<FetchCollectionsRequestAction>>
}

export type State = {
  page: number
  sortBy: CurationSortOptions
  filterByStatus: CurationStatuses
  filterByTags: string[]
  filterByType: CollectionTypes
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
  | 'isMVMFEnabled'
>

export type MapDispatchProps = Pick<Props, 'onFetchCollections'>
export type MapDispatch = Dispatch<FetchCollectionsRequestAction>
