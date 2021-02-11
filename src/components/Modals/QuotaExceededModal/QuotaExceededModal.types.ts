import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Project } from 'modules/project/types'
import { retrySync, RetrySyncAction } from 'modules/sync/actions'

export type Props = ModalProps & {
  currentProject: Project | null
  isLoggedIn: boolean
  isLoggingIn: boolean
  errors: Set<string>
  loading: Set<string>
  onRetry: typeof retrySync
}

export type State = {
  isLoginModalOpen: boolean
}

export type MapStateProps = Pick<Props, 'currentProject' | 'errors' | 'loading' | 'isLoggedIn' | 'isLoggingIn'>
export type MapDispatchProps = Pick<Props, 'onRetry'>
export type MapDispatch = Dispatch<RetrySyncAction>
