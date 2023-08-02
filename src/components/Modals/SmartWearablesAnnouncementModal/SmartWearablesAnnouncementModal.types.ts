import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'

export type Props = ModalProps & {
  onNavigate: (path: string) => void
}

export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
