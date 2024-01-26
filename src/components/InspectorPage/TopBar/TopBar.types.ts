import { Dispatch } from 'redux'
import { ModelMetrics } from 'modules/models/types'
import { OpenModalAction, openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { Project } from 'modules/project/types'
import { CallHistoryMethodAction, goBack } from 'connected-react-router'

export type Props = {
  metrics: ModelMetrics
  currentProject: Project | null
  isUploading: boolean
  onBack: typeof goBack
  onOpenModal: typeof openModal
}

export type MapStateProps = Pick<Props, 'currentProject' | 'metrics' | 'isUploading'>

export type MapDispatchProps = Pick<Props, 'onBack' | 'onOpenModal'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenModalAction>
