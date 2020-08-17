import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Deployment } from 'modules/deployment/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { Project } from 'modules/project/types'
import { LandTile } from 'modules/land/types'

export type Props = {
  project: Project
  deployment: Deployment
  onOpenModal: typeof openModal
  onNavigate: (path: string) => void
  landTiles: Record<string, LandTile>
}

export type MapStateProps = Pick<Props, 'landTiles'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onOpenModal'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenModalAction>
