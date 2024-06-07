import { Dispatch } from 'redux'
import { SceneMetrics } from '@dcl/inspector/dist/redux/scene-metrics/types'
import { OpenModalAction, openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { Project } from 'modules/project/types'

export type Props = {
  metrics: SceneMetrics
  limits: SceneMetrics
  areEntitiesOutOfBoundaries: boolean
  currentProject: Project | null
  isUploading: boolean
  onOpenModal: typeof openModal
}

export type MapStateProps = Pick<Props, 'currentProject' | 'metrics' | 'limits' | 'areEntitiesOutOfBoundaries' | 'isUploading'>

export type MapDispatchProps = Pick<Props, 'onOpenModal'>
export type MapDispatch = Dispatch<OpenModalAction>
