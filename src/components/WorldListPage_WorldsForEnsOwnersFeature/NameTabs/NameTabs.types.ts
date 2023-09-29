import { CallHistoryMethodAction } from 'connected-react-router'
import { Dispatch } from 'react'

export enum TabType {
  DCL = 'dcl',
  ENS = 'ens'
}

export type Props = {
  onNavigate: (to: string) => void
}

export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
