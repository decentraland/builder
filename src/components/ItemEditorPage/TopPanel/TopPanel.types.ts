import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'

export type Props = {
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

export type MapStateProps = Pick<Props, 'isReviewing' | 'isCommitteeMember' | 'selectedCollectionId'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
