import { Dispatch } from 'redux'
import { SignInProps } from 'decentraland-ui'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { ConnectWalletRequestAction } from 'decentraland-dapps/dist/modules/wallet/actions'
import { Coordinate, Rotation, Project } from 'modules/project/types'
import { Media } from 'modules/media/types'

import { DeployToLandRequestAction } from 'modules/deployment/actions'
import { RecordMediaRequestAction } from 'modules/media/actions'

export type Props = SignInProps & {
  isConnected: boolean
  isRecording: boolean
  isUploadingAssets: boolean
  mediaProgress: number
  ethAddress: string | undefined
  project: Project | null
  media: Media | null
  onClose: ModalProps['onClose']
  onDeploy: (ethAddress: string, point: Coordinate, rotation: Rotation) => DeployToLandRequestAction
  onRecord: () => RecordMediaRequestAction
}

export type State = {
  placement: {
    point: Coordinate
    rotation: Rotation
  } | null
  parcels: Record<string, { x: number; y: number }>
  hover: Coordinate
  hasError: boolean
  rotation: Rotation
  needsConfirmation: boolean
}

export type MapStateProps = Pick<
  Props,
  'isConnecting' | 'media' | 'hasError' | 'isRecording' | 'isUploadingAssets' | 'isConnected' | 'ethAddress' | 'project' | 'mediaProgress'
>

export type MapDispatchProps = Pick<Props, 'onConnect' | 'onDeploy' | 'onRecord'>

export type MapDispatch = Dispatch<ConnectWalletRequestAction | DeployToLandRequestAction | RecordMediaRequestAction>
