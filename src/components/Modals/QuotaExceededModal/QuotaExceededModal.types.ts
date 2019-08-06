import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { authRequest } from 'modules/auth/actions'

export type Props = ModalProps & {
  onAuth: typeof authRequest
}

export type MapDispatchProps = Pick<Props, 'onAuth'>
