import { Dispatch } from 'redux'
import { setOperatorRequest } from 'modules/land/actions'

export type Props = {
  onSetOperator: typeof setOperatorRequest
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onSetOperator'>
export type MapDispatch = Dispatch
