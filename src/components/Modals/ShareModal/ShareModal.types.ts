import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Project } from 'modules/project/types'
import { editProject } from 'modules/project/actions'
import { login } from 'modules/auth/actions'
import { share } from 'modules/ui/share/actions'

export type Props = ModalProps & {
  metadata: ShareModalMetadata
  project: Project
  isLoading: boolean
  isLoggedIn: boolean
  onSave: typeof editProject
  onLogin: typeof login
  onShare: typeof share
}

export type State = {
  copied: boolean
  type: ShareModalType
  id: string | null
}

export type OwnProps = Pick<Props, 'metadata'>
export type MapStateProps = Pick<Props, 'project' | 'isLoading' | 'isLoggedIn'>
export type MapDispatchProps = Pick<Props, 'onSave' | 'onLogin' | 'onShare'>

export enum ShareModalType {
  PROJECT = 'project',
  POOL = 'pool'
}

export type ShareModalMetadata = {
  type: ShareModalType
  id: string
}
