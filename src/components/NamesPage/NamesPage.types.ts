import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { SetLandPageViewAction } from 'modules/ui/land/actions'
import { Name } from 'modules/names/types'

export type Props = {
  names: Name[]
  isLoggedIn: boolean
  isLoading: boolean
  onNavigate: (path: string) => void
}

export type State = {}

export type MapStateProps = Pick<Props, 'names' | 'isLoading' | 'isLoggedIn'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | SetLandPageViewAction>
