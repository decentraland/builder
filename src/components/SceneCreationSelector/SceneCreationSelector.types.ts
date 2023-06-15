import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { openModal, OpenModalAction } from 'modules/modal/actions'

export type Props = {
  onOpenModal: typeof openModal
  onNavigate: (path: string) => void
}

export type MapDispatchProps = Pick<Props, 'onOpenModal' | 'onNavigate'>

export type MapDispatch = Dispatch<OpenModalAction | CallHistoryMethodAction>
