import { Dispatch } from 'redux'
import { SignInProps } from 'decentraland-ui'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { ConnectWalletRequestAction } from 'decentraland-dapps/dist/modules/wallet/actions'
import { DeploymentState } from 'modules/deployment/reducer'
import { Coordinate, Rotation } from 'modules/project/types'

export type Props = SignInProps & {
  isConnected: boolean
  isRecording: boolean
  isUploadingAssets: boolean
  images: DeploymentState['data']['images']
  onClose: ModalProps['onClose']
}

export type State = {
  placement: {
    point: Coordinate
    rotation: Rotation
  } | null
  hasError: boolean
}

export type MapStateProps = Pick<Props, 'isConnecting' | 'images' | 'hasError' | 'isRecording' | 'isUploadingAssets' | 'isConnected'>

export type MapDispatchProps = Pick<Props, 'onConnect'>

export type MapDispatch = Dispatch<ConnectWalletRequestAction>
