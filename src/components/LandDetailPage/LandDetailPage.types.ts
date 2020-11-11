import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { ProjectState } from 'modules/project/reducer'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { Deployment } from 'modules/deployment/types'
import { LandTile } from 'modules/land/types'
import { ENS } from 'modules/ens/types'

export type Props = {
  ensList: ENS[]
  parcelsAvailableToBuildEstates: Record<string, boolean>
  deploymentsByCoord: Record<string, Deployment>
  landTiles: Record<string, LandTile>
  projects: ProjectState['data']
  onNavigate: (path: string) => void
  onReplace: (path: string) => void
  onOpenModal: typeof openModal
}

export type State = {
  hovered: Deployment | null
  mouseX: number
  mouseY: number
  showTooltip: boolean
}

export type MapStateProps = Pick<Props, 'ensList' | 'parcelsAvailableToBuildEstates' | 'deploymentsByCoord' | 'projects' | 'landTiles'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onOpenModal' | 'onReplace'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenModalAction>
