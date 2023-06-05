import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { deployToWorldRequest, DeployToWorldRequestAction } from 'modules/deployment/actions'
import { ENS } from 'modules/ens/types'
import { Project } from 'modules/project/types'
import { ModelMetrics } from 'modules/models/types'
import { DeploymentState } from 'modules/deployment/reducer'
import { Deployment } from 'modules/deployment/types'

export type Props = {
  name: string
  project: Project | null
  metrics: ModelMetrics
  ensList: ENS[]
  deployments: Record<string, Deployment>
  deploymentProgress: DeploymentState['progress']
  isLoading: boolean
  onClose: () => void
  onBack: () => void
  onPublish: typeof deployToWorldRequest
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<Props, 'ensList' | 'project' | 'metrics' | 'deployments' | 'deploymentProgress' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onPublish' | 'onNavigate'>
export type MapDispatch = Dispatch<DeployToWorldRequestAction | CallHistoryMethodAction>

export enum DeployToWorldView {
  FORM = 'FORM',
  PROGRESS = 'PROGRESS',
  SUCCESS = 'SUCCESS',
  EMPTY = 'EMPTY'
}
