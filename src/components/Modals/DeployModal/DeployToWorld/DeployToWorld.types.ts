import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { SceneMetrics } from '@dcl/inspector/dist/redux/scene-metrics/types'
import { deployToWorldRequest, DeployToWorldRequestAction } from 'modules/deployment/actions'
import { recordMediaRequest, RecordMediaRequestAction } from 'modules/media/actions'
import { ENS } from 'modules/ens/types'
import { FetchContributableNamesRequestAction, FetchExternalNamesRequestAction } from 'modules/ens/actions'
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
  metrics: ModelMetrics | SceneMetrics
  ensList: ENS[]
  externalNames: ENS[]
  deployments: Record<string, Deployment>
  deploymentProgress: DeploymentState['progress']
  contributableNames: ENS[]
  error: string | null
  isLoading: boolean
  claimedName: string | null
  isWorldContributorEnabled: boolean
  onClose: () => void
  onBack: () => void
  onPublish: typeof deployToWorldRequest
  onRecord: typeof recordMediaRequest
  onNavigate: (path: string) => void
  onReplace: (path: string, locationState?: DeployToWorldLocationStateProps) => void
  onFetchContributableNames: () => void
}

export type MapStateProps = Pick<
  Props,
  | 'ensList'
  | 'externalNames'
  | 'project'
  | 'metrics'
  | 'deployments'
  | 'deploymentProgress'
  | 'error'
  | 'isLoading'
  | 'scene'
  | 'contributableNames'
  | 'isWorldContributorEnabled'
>
export type MapDispatchProps = Pick<Props, 'onPublish' | 'onNavigate' | 'onRecord' | 'onReplace' | 'onFetchContributableNames'>
export type MapDispatch = Dispatch<
  | DeployToWorldRequestAction
  | CallHistoryMethodAction
  | RecordMediaRequestAction
  | FetchExternalNamesRequestAction
  | FetchContributableNamesRequestAction
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
  ENS,
  CONTRIBUTE
}
