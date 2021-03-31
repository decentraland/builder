import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'

export enum NavigationTab {
  SCENES = 'scenes',
  LAND = 'land',
  COLLECTIONS = 'collection',
  NAMES = 'names',
  CURATION = 'curation'
}

export type Props = {
  children?: React.ReactNode
  activeTab?: NavigationTab
  isFullscreen?: boolean
  isCommitteeMember: boolean
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<Props, 'isCommitteeMember'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
