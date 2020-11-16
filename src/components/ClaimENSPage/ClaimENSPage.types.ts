import { Dispatch } from 'redux'
import { CallHistoryMethodAction, goBack } from 'connected-react-router'

export type Props = {
  onNavigate: (path: string) => void
  onBack: typeof goBack
}

export type State = {
  name: string
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onBack'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
