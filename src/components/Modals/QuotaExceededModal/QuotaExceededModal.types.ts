import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { login } from 'modules/auth/actions'
import { Project } from 'modules/project/types'

export type Props = ModalProps & {
  currentProject: Project | null
  isLoggedIn: boolean
  onAuth: typeof login
}

export type MapStateProps = Pick<Props, 'currentProject' | 'isLoggedIn'>

export type MapDispatchProps = Pick<Props, 'onAuth'>
