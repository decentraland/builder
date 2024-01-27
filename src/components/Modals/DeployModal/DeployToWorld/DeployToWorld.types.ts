import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { deployToWorldRequest, DeployToWorldRequestAction } from 'modules/deployment/actions'
import { recordMediaRequest, RecordMediaRequestAction } from 'modules/media/actions'
import { ENS } from 'modules/ens/types'
import { FetchExternalNamesRequestAction } from 'modules/ens/actions'
import { Project } from 'modules/project/types'
import { ModelMetrics } from 'modules/models/types'
import { DeploymentState } from 'modules/deployment/reducer'
import { Deployment } from 'modules/deployment/types'
import { DeployToWorldLocationStateProps } from 'modules/location/types'
import { DeployModalMetadata } from '../DeployModal.types'
import { Scene } from 'modules/scene/types'

export type Props = {
  name: string
  project: Project
  scene: Scene | null
  metrics: ModelMetrics
  ensList: ENS[]
  externalNames: ENS[]
  deployments: Record<string, Deployment>
  deploymentProgress: DeploymentState['progress']
  error: string | null
  isLoading: boolean
  claimedName: string | null
  onClose: () => void
  onBack: () => void
  onPublish: typeof deployToWorldRequest
  onRecord: typeof recordMediaRequest
  onNavigate: (path: string) => void
  onReplace: (path: string, locationState?: DeployToWorldLocationStateProps) => void
}

export type MapStateProps = Pick<
  Props,
  'ensList' | 'externalNames' | 'project' | 'metrics' | 'deployments' | 'deploymentProgress' | 'error' | 'isLoading' | 'scene'
>
export type MapDispatchProps = Pick<Props, 'onPublish' | 'onNavigate' | 'onRecord' | 'onReplace'>
export type MapDispatch = Dispatch<
  DeployToWorldRequestAction | CallHistoryMethodAction | RecordMediaRequestAction | FetchExternalNamesRequestAction
>

export enum DeployToWorldView {
  FORM = 'FORM',
  PROGRESS = 'PROGRESS',
  SUCCESS = 'SUCCESS',
  EMPTY = 'EMPTY',
  ERROR = 'ERROR'
}

export type DeployToWorldModalMetadata = DeployModalMetadata & {
  projectId: string
  claimedName: string
}

export enum NameType {
  DCL,
  ENS
}
