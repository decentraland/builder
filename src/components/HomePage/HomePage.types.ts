import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'

export type Props = {
  isLoggingIn: boolean
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<Props, 'isLoggingIn'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
