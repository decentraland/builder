import { ModalProps } from 'decentraland-ui'
import { Dispatch } from 'redux'
import { SetENSAddressRequestAction } from 'modules/ens/actions'

export type Props = ModalProps & {
  error: string | null
  isLoading: boolean
  onSave: (address: string) => void
}

export type MapStateProps = Pick<Props, 'error' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onSave'>
export type MapDispatch = Dispatch<SetENSAddressRequestAction>
export type OwnProps = Omit<Props, keyof MapDispatchProps>
