import { Dispatch } from 'redux'
import { SignInProps } from 'decentraland-ui'
import { NavigateToAction } from 'decentraland-dapps/dist/modules/location/actions'
import { ConnectWalletRequestAction } from 'decentraland-dapps/dist/modules/wallet/actions'
import { Coordinate, Rotation, DeploymentStatus, Deployment, OccupiedAtlasParcel } from 'modules/deployment/types'
import { DeployToLandRequestAction, deployToLandRequest, LoadDeploymentsRequestAction } from 'modules/deployment/actions'
import { RecordMediaRequestAction, recordMediaRequest } from 'modules/media/actions'
import { DeploymentState } from 'modules/deployment/reducer'
import { Project } from 'modules/project/types'
import { Media } from 'modules/media/types'

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
  deployment: Deployment | null
  occupiedParcels: Record<string, OccupiedAtlasParcel>
  onConnect: SignInProps['onConnect']
  onClose: () => void
  onDeploy: typeof deployToLandRequest
  onRecord: typeof recordMediaRequest
  onDeployToPool: () => void
  onClearDeployment: (projectId: string) => void
  onBack: () => void
  onNavigateHome: () => void
  onFetchDeployments: () => void
}

export type State = {
  placement: {
    point: Coordinate
    rotation: Rotation
  } | null
  needsConfirmation: boolean
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
  | 'deployment'
  | 'mediaProgress'
  | 'deploymentProgress'
  | 'occupiedParcels'
>

export type MapDispatchProps = Pick<Props, 'onConnect' | 'onDeploy' | 'onRecord' | 'onNavigateHome' | 'onFetchDeployments'>

export type MapDispatch = Dispatch<
  ConnectWalletRequestAction | DeployToLandRequestAction | RecordMediaRequestAction | NavigateToAction | LoadDeploymentsRequestAction
>

export enum DeployToLandView {
  NONE = 'NONE',
  CONNECT = 'CONNECT',
  PROGRESS = 'PROGRESS',
  MAP = 'MAP',
  SUCCESS = 'SUCCESS',
  CONFIRMATION = 'CONFIRMATION'
}
