import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { WorldsWalletStats } from 'lib/api/worlds'
import { AccountHoldings } from './utils'

export type Props = ModalProps & {
  metadata: WorldsYourStorageModalMetadata
}

export type State = {
  accountHoldings: AccountHoldings | null
}

export type WorldsYourStorageModalMetadata = {
  stats: WorldsWalletStats
}

export type OwnProps = Pick<Props, 'metadata'>
export type MapDispatch = Dispatch
