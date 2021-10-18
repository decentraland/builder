import { Dispatch } from 'redux'
import { InitiateApprovalFlowAction, rejectCollectionRequest, RejectCollectionRequestAction } from 'modules/collection/actions'
import { Collection } from 'modules/collection/types'
import { rejectCurationRequest, RejectCurationRequestAction } from 'modules/curation/actions'
import { Curation } from 'modules/curation/types'

export enum ReviewType {
  REJECT_COLLECTION = 'REJECT_COLLECTION',
  REJECT_CURATION = 'REJECT_CURATION',
  DISABLE_COLLECTION = 'DISABLE_COLLECTION'
}

export type Props = {
  open: boolean
  type: ReviewType
  isLoading: boolean
  hasPendingTransaction: boolean
  collection: Collection
  curation: Curation | null
  onReject: typeof rejectCollectionRequest
  onRejectCuration: typeof rejectCurationRequest
  onClose: () => void
}

export type MapStateProps = Pick<Props, 'isLoading' | 'hasPendingTransaction'>
export type MapDispatchProps = Pick<Props, 'onReject' | 'onRejectCuration'>
export type MapDispatch = Dispatch<RejectCollectionRequestAction | RejectCurationRequestAction | InitiateApprovalFlowAction>
export type OwnProps = Pick<Props, 'open' | 'type' | 'collection' | 'curation'>
