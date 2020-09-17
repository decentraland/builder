import { Dispatch } from 'redux'
import { setNameResolverRequest } from 'modules/land/actions'

export type Props = {
  onSetNameResolver: typeof setNameResolverRequest
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onSetNameResolver'>
export type MapDispatch = Dispatch
