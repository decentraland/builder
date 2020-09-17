import { Dispatch } from 'redux'
import { setNameResolverRequest } from 'modules/land/actions'

export type Props = {
  error: string | null
  onSetNameResolver: typeof setNameResolverRequest
}

export type MapStateProps = {
  error: string | null
}
export type MapDispatchProps = Pick<Props, 'onSetNameResolver'>
export type MapDispatch = Dispatch
