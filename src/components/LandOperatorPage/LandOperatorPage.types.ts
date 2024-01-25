import { Dispatch } from 'redux'
import { setOperatorRequest } from 'modules/land/actions'

export type Props = {
  isEnsAddressEnabled: boolean
  onSetOperator: typeof setOperatorRequest
}

export type MapStateProps = Pick<Props, 'isEnsAddressEnabled'>
export type MapDispatchProps = Pick<Props, 'onSetOperator'>
export type MapDispatch = Dispatch
