import { Dispatch } from 'redux'
import { SignInProps } from 'decentraland-ui'
import { CallHistoryMethodAction } from 'connected-react-router'
import { EnableWalletRequestAction, enableWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'
import { Coordinate, Rotation, DeploymentStatus, Deployment } from 'modules/deployment/types'
import { DeployToLandRequestAction, deployToLandRequest } from 'modules/deployment/actions'
import { RecordMediaRequestAction, recordMediaRequest } from 'modules/media/actions'
import { DeploymentState } from 'modules/deployment/reducer'
import { Project } from 'modules/project/types'
import { Media } from 'modules/media/types'
import { LandTile } from 'modules/land/types'

export type Props = {
  name: string
  error: string | null
  walletError: SignInProps['hasError']
  isConnected: SignInProps['isConnected']
  isConnecting: SignInProps['isConnecting']
  isRecording: boolean
  isUploadingAssets: boolean
  isCreatingFiles: boolean
  isUploadingRecording: boolean
  isLoggedIn: boolean
  mediaProgress: number
  deploymentProgress: DeploymentState['progress']
  ethAddress: string | undefined
  project: Project
  media: Media | null
  deploymentStatus: DeploymentStatus
  deployments: Deployment[]
  deploymentsByCoord: Record<string, Deployment>
  landTiles: Record<string, LandTile>
  onConnect: typeof enableWalletRequest
  onClose: () => void
  onDeploy: typeof deployToLandRequest
  onRecord: typeof recordMediaRequest
  onDeployToPool: () => void
  onClearDeployment: (projectId: string) => void
  onBack: () => void
  onNavigateHome: () => void
}

export type State = {
  placement: {
    point: Coordinate
    rotation: Rotation
  } | null
  needsConfirmation: boolean
  coords: string | null
  overrideDeploymentId?: string
  view: DeployToLandView
}

export type MapStateProps = Pick<
  Props,
  | 'isConnecting'
  | 'media'
  | 'error'
  | 'walletError'
  | 'isRecording'
  | 'isUploadingAssets'
  | 'isUploadingRecording'
  | 'isCreatingFiles'
  | 'isConnected'
  | 'isLoggedIn'
  | 'ethAddress'
  | 'project'
  | 'deploymentStatus'
  | 'deployments'
  | 'mediaProgress'
  | 'deploymentProgress'
  | 'deploymentsByCoord'
  | 'landTiles'
>

export type MapDispatchProps = Pick<Props, 'onConnect' | 'onDeploy' | 'onRecord' | 'onNavigateHome'>

export type MapDispatch = Dispatch<
  EnableWalletRequestAction | DeployToLandRequestAction | RecordMediaRequestAction | CallHistoryMethodAction
>

export enum DeployToLandView {
  NONE = 'NONE',
  CONNECT = 'CONNECT',
  PROGRESS = 'PROGRESS',
  MAP = 'MAP',
  SUCCESS = 'SUCCESS',
  CONFIRMATION = 'CONFIRMATION'
}
