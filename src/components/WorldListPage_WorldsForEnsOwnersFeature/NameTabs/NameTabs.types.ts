import { CallHistoryMethodAction } from 'connected-react-router'
import { Dispatch } from 'react'

export type Props = {
  onNavigate: (to: string) => void
}

export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
