import { Dispatch } from 'redux'
import { setNameResolverRequest } from 'modules/land/actions'

export type Props = {
  error: string | null
  isLoading: boolean
  onSetNameResolver: typeof setNameResolverRequest
}

export type MapStateProps = {
  error: string | null
  isLoading: boolean
}
export type MapDispatchProps = Pick<Props, 'onSetNameResolver'>
export type MapDispatch = Dispatch
