import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { WorldsWalletStats } from 'lib/api/worlds'

export type Props = ModalProps & {
  metadata: WorldsYourStorageModalMetadata
}

export type WorldsYourStorageModalMetadata = {
  stats: WorldsWalletStats
}

export type OwnProps = Pick<Props, 'metadata'>
export type MapDispatch = Dispatch
