import { Dispatch } from 'redux'
import {
  approveCollectionRequest,
  ApproveCollectionRequestAction,
  rejectCollectionRequest,
  RejectCollectionRequestAction
} from 'modules/collection/actions'
import { Collection } from 'modules/collection/types'
import {
  approveCurationRequest,
  ApproveCurationRequestAction,
  rejectCurationRequest,
  RejectCurationRequestAction
} from 'modules/curation/actions'
import { Curation } from 'modules/curation/types'

export enum ReviewType {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  APPROVE_CURATION = 'APPROVE_CURATION',
  REJECT_CURATION = 'REJECT_CURATION',
  DISABLE = 'DISABLE',
}

export type Props = {
  open: boolean
  type: ReviewType
  isLoading: boolean
  hasPendingTransaction: boolean
  collection: Collection
  curation: Curation | null
  onApprove: typeof approveCollectionRequest
  onReject: typeof rejectCollectionRequest
  onApproveCuration: typeof approveCurationRequest
  onRejectCuration: typeof rejectCurationRequest
  onClose: () => void
}

export type MapStateProps = Pick<Props, 'isLoading' | 'hasPendingTransaction'>
export type MapDispatchProps = Pick<Props, 'onApprove' | 'onReject' | 'onApproveCuration' | 'onRejectCuration'>
export type MapDispatch = Dispatch<
  ApproveCollectionRequestAction | RejectCollectionRequestAction | ApproveCurationRequestAction | RejectCurationRequestAction
>
export type OwnProps = Pick<Props, 'open' | 'type' | 'collection' | 'curation'>
