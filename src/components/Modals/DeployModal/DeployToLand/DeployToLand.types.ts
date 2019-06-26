import { Dispatch } from 'redux'
import { SignInProps } from 'decentraland-ui'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { ConnectWalletRequestAction } from 'decentraland-dapps/dist/modules/wallet/actions'
import { Coordinate, Rotation, Placement, DeploymentStatus } from 'modules/deployment/types'
import { DeployToLandRequestAction } from 'modules/deployment/actions'
import { RecordMediaRequestAction } from 'modules/media/actions'
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
  onClose: ModalProps['onClose']
  onDeploy: (ethAddress: string, placement: Placement) => DeployToLandRequestAction
  onRecord: () => RecordMediaRequestAction
}

export type State = {
  placement: {
    point: Coordinate
    rotation: Rotation
  } | null
  hasError: boolean
  needsConfirmation: boolean
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
  | 'mediaProgress'
  | 'deploymentProgress'
>

export type MapDispatchProps = Pick<Props, 'onConnect' | 'onDeploy' | 'onRecord'>

export type MapDispatch = Dispatch<ConnectWalletRequestAction | DeployToLandRequestAction | RecordMediaRequestAction>
