import { Dispatch } from 'redux'
import { SignInProps } from 'decentraland-ui'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { ConnectWalletRequestAction } from 'decentraland-dapps/dist/modules/wallet/actions'
import { Coordinate, Rotation } from 'modules/project/types'
import { Media } from 'modules/media/types'

export type Props = SignInProps & {
  isConnected: boolean
  isRecording: boolean
  isUploadingAssets: boolean
  media: Media | null
  onClose: ModalProps['onClose']
}

export type State = {
  placement: {
    point: Coordinate
    rotation: Rotation
  } | null
  hasError: boolean
}

export type MapStateProps = Pick<Props, 'isConnecting' | 'media' | 'hasError' | 'isRecording' | 'isUploadingAssets' | 'isConnected'>

export type MapDispatchProps = Pick<Props, 'onConnect'>

export type MapDispatch = Dispatch<ConnectWalletRequestAction>
