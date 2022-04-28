import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { Collection } from 'modules/collection/types'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'
import { CurationStatus } from 'modules/curations/types'

export enum SortBy {
  MOST_RELEVANT = 'MOST_RELEVANT',
  NEWEST = 'NEWEST',
  NAME_DESC = 'NAME_DESC',
  NAME_ASC = 'NAME_ASC'
}

export enum CurationExtraStatuses {
  ALL_STATUS = 'ALL_STATUS'
}

export const CurationFilterOptions = { ...CurationStatus, ...CurationExtraStatuses }

export type Filters = CurationStatus | CurationExtraStatuses

export type Props = {
  wallet: Wallet
  collections: Collection[]
  curationsByCollectionId: Record<string, CollectionCuration>
  isCommitteeMember: boolean
  committeeMembers: string[]
  isConnecting: boolean
  isLoading: boolean
  onNavigate: (path: string) => void
}

export type State = {
  page: number
  sortBy: SortBy
  filterBy: Filters
  assigneeFilter: string
  searchText: string
}

export type MapStateProps = Pick<
  Props,
  'wallet' | 'collections' | 'curationsByCollectionId' | 'isCommitteeMember' | 'committeeMembers' | 'isConnecting' | 'isLoading'
>
