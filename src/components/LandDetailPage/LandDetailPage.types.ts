import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { Deployment } from 'modules/deployment/types'
import { ProjectState } from 'modules/project/reducer'

export type Props = {
  parcelsAvailableToBuildEstates: Record<string, boolean>
  deploymentsByCoord: Record<string, Deployment>
  onNavigate: (path: string) => void
  onOpenModal: typeof openModal
  projects: ProjectState['data']
}

export type State = {
  hovered: string | null
}

export type MapStateProps = Pick<Props, 'parcelsAvailableToBuildEstates' | 'deploymentsByCoord' | 'projects'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onOpenModal'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenModalAction>
