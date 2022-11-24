import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'

export type Props = {
  isLoggingIn: boolean
  isLoggedIn: boolean
  hasRouterHistory: boolean
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<Props, 'isLoggedIn' | 'isLoggingIn' | 'hasRouterHistory'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
