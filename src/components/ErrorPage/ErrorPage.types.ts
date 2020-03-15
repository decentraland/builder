import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'

export type Props = {
  stackTrace: string
  onNavigate: (path: string) => void
}

export type OwnProps = Pick<Props, 'stackTrace'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
