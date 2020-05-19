import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Land } from 'modules/land/types'
import { Project } from 'modules/project/types'

export type Props = {
  land: Land
  projects: Project[]
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<Props, 'projects'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
export type OwnProps = Pick<Props, 'land'>
