import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Project } from 'modules/project/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'

export type Props = {
  template: Project | null
  isLoading: boolean
  onNavigate: (path: string) => void
  onOpenModal: typeof openModal
}

export type MapStateProps = Pick<Props, 'template' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onOpenModal'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenModalAction>
