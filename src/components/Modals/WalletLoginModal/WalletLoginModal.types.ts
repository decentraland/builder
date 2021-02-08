import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { loginRequest, LoginRequestAction } from 'modules/identity/actions'

export type Props = ModalProps & {
  onConnect: typeof loginRequest
}

export type OwnProps = Pick<Props, 'metadata'>
export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onConnect'>
export type MapDispatch = Dispatch<LoginRequestAction>
