import { Dispatch } from 'redux'
import { Land } from 'modules/land/types'
import { CallHistoryMethodAction } from 'connected-react-router'

export type Props = {
  land: Land
  children?: React.ReactNode
  title?: React.ReactNode
  subtitle?: React.ReactNode
  onNavigate: (path: string) => void
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
