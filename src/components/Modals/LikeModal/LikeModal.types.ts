import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { loginRequest } from 'modules/identity/actions'

export type Props = ModalProps & {
  isLoggedIn: boolean
  onLogin: typeof loginRequest
}

export type MapStateProps = Pick<Props, 'isLoggedIn'>
export type MapDispatchProps = Pick<Props, 'onLogin'>
