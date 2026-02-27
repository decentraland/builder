import { Dispatch } from 'redux'
import { RouteComponentProps } from 'react-router-dom'
import { ProjectState } from 'modules/project/reducer'
import { openModal, OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'
import { Deployment } from 'modules/deployment/types'
import { LandTile } from 'modules/land/types'
import { ENS } from 'modules/ens/types'

export type Props = {
  ensList: ENS[]
  parcelsAvailableToBuildEstates: Record<string, boolean>
  deploymentsByCoord: Record<string, Deployment>
  landTiles: Record<string, LandTile>
  projects: ProjectState['data']
  onOpenModal: ActionFunction<typeof openModal>
} & Pick<RouteComponentProps, 'history'>

export type State = {
  hovered: Deployment | null
  mouseX: number
  mouseY: number
  showTooltip: boolean
}

export type MapStateProps = Pick<Props, 'ensList' | 'parcelsAvailableToBuildEstates' | 'deploymentsByCoord' | 'projects' | 'landTiles'>
export type MapDispatchProps = Pick<Props, 'onOpenModal'>
export type MapDispatch = Dispatch<OpenModalAction>
