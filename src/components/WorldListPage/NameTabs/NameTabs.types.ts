import { CallHistoryMethodAction } from 'connected-react-router'
import { Dispatch } from 'react'

export type Props = {
  isWorldContributorEnabled: boolean
  onNavigate: (to: string) => void
}

export type MapStateProps = Pick<Props, 'isWorldContributorEnabled'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
