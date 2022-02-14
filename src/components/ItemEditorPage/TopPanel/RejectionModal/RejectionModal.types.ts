import { Dispatch } from 'redux'
import { InitiateApprovalFlowAction, rejectCollectionRequest, RejectCollectionRequestAction } from 'modules/collection/actions'
import { Collection } from 'modules/collection/types'
import { rejectCollectionCurationRequest, RejectCollectionCurationRequestAction } from 'modules/curations/collectionCuration/actions'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'

export enum RejectionType {
  REJECT_COLLECTION = 'REJECT_COLLECTION',
  REJECT_CURATION = 'REJECT_CURATION',
  DISABLE_COLLECTION = 'DISABLE_COLLECTION'
}

export type Props = {
  open: boolean
  type: RejectionType
  isLoading: boolean
  hasPendingTransaction: boolean
  collection: Collection
  curation: CollectionCuration | null
  onReject: typeof rejectCollectionRequest
  onRejectCuration: typeof rejectCollectionCurationRequest
  onClose: () => void
}

export type MapStateProps = Pick<Props, 'isLoading' | 'hasPendingTransaction'>
export type MapDispatchProps = Pick<Props, 'onReject' | 'onRejectCuration'>
export type MapDispatch = Dispatch<RejectCollectionRequestAction | RejectCollectionCurationRequestAction | InitiateApprovalFlowAction>
export type OwnProps = Pick<Props, 'open' | 'type' | 'collection' | 'curation'>
