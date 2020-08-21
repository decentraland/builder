import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'

export enum NavigationTab {
  SCENES = 'scenes',
  LAND = 'land',
  AVATAR = 'avatar'
}

export type Props = {
  activeTab?: NavigationTab
  onNavigate: (path: string) => void
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
