import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import {
  approveCollectionRequest,
  ApproveCollectionRequestAction,
  rejectCollectionRequest,
  RejectCollectionRequestAction
} from 'modules/collection/actions'

export type Props = {
  isReviewing: boolean
  selectedCollectionId: string | null
  onReject: typeof rejectCollectionRequest
  onApprove: typeof approveCollectionRequest
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<Props, 'isReviewing' | 'selectedCollectionId'>
export type MapDispatchProps = Pick<Props, 'onReject' | 'onApprove' | 'onNavigate'>
export type MapDispatch = Dispatch<ApproveCollectionRequestAction | RejectCollectionRequestAction | CallHistoryMethodAction>
