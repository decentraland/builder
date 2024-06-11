import { Dispatch } from 'redux'
import { RouteComponentProps } from 'react-router-dom'
import { Deployment } from 'modules/deployment/types'
import { openModal, OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'
import { Project } from 'modules/project/types'
import { LandTile } from 'modules/land/types'

export type Props = {
  project: Project
  deployment: Deployment
  onOpenModal: typeof openModal
  landTiles: Record<string, LandTile>
} & RouteComponentProps

export type MapStateProps = Pick<Props, 'landTiles'>
export type MapDispatchProps = Pick<Props, 'onOpenModal'>
export type MapDispatch = Dispatch<OpenModalAction>
