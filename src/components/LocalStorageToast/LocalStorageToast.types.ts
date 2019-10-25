import { Dispatch } from 'redux'
import { LoginAction, login } from 'modules/auth/actions'
import { Project } from 'modules/project/types'

export type Props = {
  project: Project | null
  isVisible: boolean
  onLogin: typeof login
}

export type State = {
  isVisible: boolean
}

export type MapStateProps = Pick<Props, 'project'>

export type MapDispatchProps = Pick<Props, 'onLogin'>

export type MapDispatch = Dispatch<LoginAction>
