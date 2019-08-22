import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { login } from 'modules/auth/actions'
import { Project } from 'modules/project/types'
import { retrySync } from 'modules/sync/actions'

export type Props = ModalProps & {
  currentProject: Project | null
  isLoggedIn: boolean
  errors: Set<string>
  loading: Set<string>
  onLogin: typeof login
  onRetry: typeof retrySync
}

export type MapStateProps = Pick<Props, 'currentProject' | 'errors' | 'loading' | 'isLoggedIn'>

export type MapDispatchProps = Pick<Props, 'onLogin' | 'onRetry'>
