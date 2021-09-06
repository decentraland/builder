import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { setENSContentRequest, SetENSContentRequestAction } from 'modules/ens/actions'

export type Props = ModalProps & {
  isLoading: boolean,
  onUnsetENSContent: typeof setENSContentRequest
}

export type MapStateProps = Pick<Props, 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onUnsetENSContent'>
export type MapDispatch = Dispatch<SetENSContentRequestAction>
