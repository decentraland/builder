import { Dispatch } from 'redux'
import {
  approveCollectionRequest,
  ApproveCollectionRequestAction,
  rejectCollectionRequest,
  RejectCollectionRequestAction
} from 'modules/collection/actions'
import { Collection } from 'modules/collection/types'

export enum ReviewType {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT'
}

export type Props = {
  open: boolean
  type: ReviewType
  isLoading: boolean
  hasPendingTransaction: boolean
  collection: Collection
  onApprove: typeof approveCollectionRequest
  onReject: typeof rejectCollectionRequest
  onClose: () => void
}

export type MapStateProps = Pick<Props, 'isLoading' | 'hasPendingTransaction'>
export type MapDispatchProps = Pick<Props, 'onApprove' | 'onReject'>
export type MapDispatch = Dispatch<ApproveCollectionRequestAction | RejectCollectionRequestAction>
export type OwnProps = Pick<Props, 'open' | 'type' | 'collection'>
