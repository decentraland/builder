import { Dispatch } from 'redux'
import { SignInProps } from 'decentraland-ui'
import { ConnectWalletRequestAction } from 'decentraland-dapps/dist/modules/wallet/actions'
import { Coordinate, Rotation, DeploymentStatus, Deployment } from 'modules/deployment/types'
import { DeployToLandRequestAction, deployToLandRequest } from 'modules/deployment/actions'
import { RecordMediaRequestAction, recordMediaRequest } from 'modules/media/actions'
import { DeploymentState } from 'modules/deployment/reducer'
import { Project } from 'modules/project/types'
import { Media } from 'modules/media/types'

export type Props = SignInProps & {
  isConnected: boolean
  isRecording: boolean
  isUploadingAssets: boolean
  isCreatingFiles: boolean
  mediaProgress: number
  deploymentProgress: DeploymentState['progress']
  ethAddress: string | undefined
  project: Project | null
  media: Media | null
  deploymentStatus: DeploymentStatus
  deployment: Deployment | null
  occupiedParcels: Record<string, Coordinate>
  onClose: () => void
  onDeploy: typeof deployToLandRequest
  onRecord: typeof recordMediaRequest
  onDeployToPool: () => void
  onBack: () => void
}

export type State = {
  placement: {
    point: Coordinate
    rotation: Rotation
  } | null
  hasError: boolean
  needsConfirmation: boolean
  view: DeployToLandView
}

export type MapStateProps = Pick<
  Props,
  | 'isConnecting'
  | 'media'
  | 'hasError'
  | 'isRecording'
  | 'isUploadingAssets'
  | 'isCreatingFiles'
  | 'isConnected'
  | 'ethAddress'
  | 'project'
  | 'deploymentStatus'
  | 'deployment'
  | 'mediaProgress'
  | 'deploymentProgress'
  | 'occupiedParcels'
>

export type MapDispatchProps = Pick<Props, 'onConnect' | 'onDeploy' | 'onRecord'>

export type MapDispatch = Dispatch<ConnectWalletRequestAction | DeployToLandRequestAction | RecordMediaRequestAction>

export enum DeployToLandView {
  NONE = 'NONE',
  CONNECT = 'CONNECT',
  PROGRESS = 'PROGRESS',
  MAP = 'MAP',
  SUCCESS = 'SUCCESS',
  CONFIRMATION = 'CONFIRMATION'
}
