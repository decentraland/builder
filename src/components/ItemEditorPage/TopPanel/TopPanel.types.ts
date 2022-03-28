import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { ChainId } from '@dcl/schemas'
import {
  initiateApprovalFlow,
  InitiateApprovalFlowAction,
  initiateTPApprovalFlow,
  InitiateTPApprovalFlowAction
} from 'modules/collection/actions'
import { RejectionType } from './RejectionModal/RejectionModal.types'

export type Props = {
  chainId?: ChainId
  isConnected: boolean
  isReviewing: boolean
  isCommitteeMember: boolean
  selectedCollectionId: string | null
  onNavigate: (path: string) => void
  onInitiateApprovalFlow: typeof initiateApprovalFlow
  onInitiateTPApprovalFlow: typeof initiateTPApprovalFlow
}

export type State = {
  currentVeredict?: boolean
  showRejectionModal: RejectionType | null
}

export enum ButtonType {
  APPROVE,
  REJECT,
  ENABLE,
  DISABLE
}

export type MapStateProps = Pick<Props, 'chainId' | 'isConnected' | 'isReviewing' | 'isCommitteeMember' | 'selectedCollectionId'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onInitiateApprovalFlow' | 'onInitiateTPApprovalFlow'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | InitiateApprovalFlowAction | InitiateTPApprovalFlowAction>
