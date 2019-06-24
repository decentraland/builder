import { Dispatch } from 'redux'
import { SignInProps } from 'decentraland-ui'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { ConnectWalletRequestAction } from 'decentraland-dapps/dist/modules/wallet/actions'
import { Coordinate, Rotation } from 'modules/project/types'
import { Media } from 'modules/media/types'

import { DeployToLandRequestAction } from 'modules/deployment/actions'
import { RecordMediaRequestAction } from 'modules/media/actions'

export type Props = SignInProps & {
  isConnected: boolean
  isRecording: boolean
  isUploadingAssets: boolean
  ethAddress: string | undefined
  media: Media | null
  onClose: ModalProps['onClose']
  onDeploy: () => DeployToLandRequestAction
  onRecord: () => RecordMediaRequestAction
}

export type State = {
  placement: {
    point: Coordinate
    rotation: Rotation
  } | null
  parcels: Record<string, { x: number; y: number }>
  hasError: boolean
}

export type MapStateProps = Pick<
  Props,
  'isConnecting' | 'media' | 'hasError' | 'isRecording' | 'isUploadingAssets' | 'isConnected' | 'ethAddress'
>

export type MapDispatchProps = Pick<Props, 'onConnect' | 'onDeploy' | 'onRecord'>

export type MapDispatch = Dispatch<ConnectWalletRequestAction | DeployToLandRequestAction | RecordMediaRequestAction>
