import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'

export enum NavigationTab {
  OVERVIEW = 'overview',
  SCENES = 'scenes',
  LAND = 'land',
  COLLECTIONS = 'collections',
  NAMES = 'names',
  WORLDS = 'worlds',
  CURATION = 'curation'
}

export type Props = {
  children?: React.ReactNode
  activeTab?: NavigationTab
  isFullscreen?: boolean
  isCommitteeMember: boolean
  isDeployToWorldEnabled: boolean
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<Props, 'isCommitteeMember' | 'isDeployToWorldEnabled'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
