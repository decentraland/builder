import { Dispatch } from 'redux'
import { LoginAction } from 'modules/auth/actions'
import { Project } from 'modules/project/types'

export type Props = {
  project: Project | null
  isVisible: boolean
  onLogin: (projectId: string) => void
}

export type State = {
  isVisible: boolean
}

export type MapStateProps = {}

export type MapDispatchProps = Pick<Props, 'onLogin'>

export type MapDispatch = Dispatch<LoginAction>
