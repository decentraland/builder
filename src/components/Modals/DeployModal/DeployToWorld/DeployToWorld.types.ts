import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { deployToWorldRequest, DeployToWorldRequestAction } from 'modules/deployment/actions'
import { recordMediaRequest, RecordMediaRequestAction } from 'modules/media/actions'
import { ENS } from 'modules/ens/types'
import { Project } from 'modules/project/types'
import { ModelMetrics } from 'modules/models/types'
import { DeploymentState } from 'modules/deployment/reducer'
import { Deployment } from 'modules/deployment/types'

export type Props = {
  name: string
  project: Project
  metrics: ModelMetrics
  ensList: ENS[]
  deployments: Record<string, Deployment>
  deploymentProgress: DeploymentState['progress']
  error: string | null
  isLoading: boolean
  onClose: () => void
  onBack: () => void
  onPublish: typeof deployToWorldRequest
  onRecord: typeof recordMediaRequest
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<Props, 'ensList' | 'project' | 'metrics' | 'deployments' | 'deploymentProgress' | 'error' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onPublish' | 'onNavigate' | 'onRecord'>
export type MapDispatch = Dispatch<DeployToWorldRequestAction | CallHistoryMethodAction | RecordMediaRequestAction>

export enum DeployToWorldView {
  FORM = 'FORM',
  PROGRESS = 'PROGRESS',
  SUCCESS = 'SUCCESS',
  EMPTY = 'EMPTY',
  ERROR = 'ERROR'
}
