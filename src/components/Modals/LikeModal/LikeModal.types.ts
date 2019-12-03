import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { login } from 'modules/auth/actions'

export type Props = ModalProps & {
  metadata: ShareModalMetadata
  onLogin: typeof login
}

export type State = {}

export type OwnProps = Pick<Props, 'metadata'>
export type MapStateProps = {}
export type MapDispatchProps = Pick<Props,'onLogin'>

export type ShareModalMetadata = {
  currentUrl: string
}
