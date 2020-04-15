import { Dispatch } from 'redux'
import { Project } from 'modules/project/types'
import { LoginRequestAction, loginRequest } from 'modules/identity/actions'

export type Props = {
  project: Project | null
  isVisible: boolean
  onLogin: typeof loginRequest
}

export type State = {
  isVisible: boolean
}

export type MapStateProps = Pick<Props, 'project'>

export type MapDispatchProps = Pick<Props, 'onLogin'>

export type MapDispatch = Dispatch<LoginRequestAction>
