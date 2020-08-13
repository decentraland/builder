import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { Deployment } from 'modules/deployment/types'

export type Props = {
  parcelsAvailableToBuildEstates: Record<string, boolean>
  deploymentsByCoord: Record<string, Deployment>
  onNavigate: (path: string) => void
  onOpenModal: typeof openModal
}

export type State = {
  hovered: string | null
}

export type MapStateProps = Pick<Props, 'parcelsAvailableToBuildEstates' | 'deploymentsByCoord'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onOpenModal'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenModalAction>
