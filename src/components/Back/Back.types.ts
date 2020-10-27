import { Dispatch } from 'redux'
import { CallHistoryMethodAction, goBack } from 'connected-react-router'
import { BackProps } from 'decentraland-ui'

export type Props = BackProps & {
  hasHistory: boolean
  onBack: typeof goBack
}

export type MapStateProps = Pick<Props, 'hasHistory'>
export type MapDispatchProps = Pick<Props, 'onBack'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
