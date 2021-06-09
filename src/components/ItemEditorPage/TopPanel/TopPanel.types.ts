import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { ChainId } from '@dcl/schemas'

export type Props = {
  chainId?: ChainId
  isReviewing: boolean
  isCommitteeMember: boolean
  selectedCollectionId: string | null
  onNavigate: (path: string) => void
}

export type State = {
  currentVeredict?: boolean
  isApproveModalOpen: boolean
  isRejectModalOpen: boolean
}

export type MapStateProps = Pick<Props, 'isReviewing' | 'isCommitteeMember' | 'selectedCollectionId' | 'chainId'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
