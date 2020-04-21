import { loginRequest, LoginRequestAction } from 'modules/identity/actions'
import { LEGACY_login, LEGACY_LoginAction, LEGACY_LogoutAction, migrationRequest, MigrationRequestAction } from 'modules/auth/actions'
import { Dispatch } from 'redux'
import { Project } from 'modules/project/types'

export type Props = {
  isLoggedIn: boolean
  isLegacyLoggedIn: boolean
  isMigrating: boolean
  onLogin: typeof loginRequest
  onLegacyLogin: typeof LEGACY_login
  error: string | null
  onMigrate: typeof migrationRequest
}

export type State = {
  projects: Project[]
  isLoading: boolean
  hasStarted: boolean
  error: string | null
}

export type MapStateProps = Pick<Props, 'isLoggedIn' | 'isLegacyLoggedIn' | 'isMigrating' | 'error'>
export type MapDispatchProps = Pick<Props, 'onLogin' | 'onLegacyLogin' | 'onMigrate'>
export type MapDispatch = Dispatch<LoginRequestAction | LEGACY_LoginAction | LEGACY_LogoutAction | MigrationRequestAction>
