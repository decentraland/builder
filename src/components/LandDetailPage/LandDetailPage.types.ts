import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { Deployment } from 'modules/deployment/types'
import { ProjectState } from 'modules/project/reducer'
import { LandTile } from 'modules/land/types'

export type Props = {
  parcelsAvailableToBuildEstates: Record<string, boolean>
  deploymentsByCoord: Record<string, Deployment>
  landTiles: Record<string, LandTile>
  onNavigate: (path: string) => void
  onOpenModal: typeof openModal
  projects: ProjectState['data']
}

export type State = {
  hovered: Deployment | null
  mouseX: number
  mouseY: number
  showTooltip: boolean
}

export type MapStateProps = Pick<Props, 'parcelsAvailableToBuildEstates' | 'deploymentsByCoord' | 'projects' | 'landTiles'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onOpenModal'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenModalAction>
