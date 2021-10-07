import { Dispatch } from 'redux'
import {
  approveCollectionRequest,
  ApproveCollectionRequestAction,
  initiateApprovalFlow,
  InitiateApprovalFlowAction,
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
  REJECT_CURATION = 'REJECT_CURATION'
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
  onInitiateApprovalFlow: typeof initiateApprovalFlow
  onClose: () => void
}

export type MapStateProps = Pick<Props, 'isLoading' | 'hasPendingTransaction'>
export type MapDispatchProps = Pick<Props, 'onReject' | 'onRejectCuration' | 'onInitiateApprovalFlow'>
export type MapDispatch = Dispatch<RejectCollectionRequestAction | RejectCurationRequestAction | InitiateApprovalFlowAction>
export type OwnProps = Pick<Props, 'open' | 'type' | 'collection' | 'curation'>
