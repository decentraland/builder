import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Project } from 'modules/project/types'
import { shareProject } from 'modules/project/actions'
import { login } from 'modules/auth/actions'

export type Props = ModalProps & {
  metadata: ShareModalMetadata
  project: Project
  isLoading: boolean
  isLoggedIn: boolean
  isScreenshotReady: boolean
  onUpdate: typeof shareProject
  onLogin: typeof login
}

export type State = {
  copied: boolean
  type: ShareModalType
  id: string | null
}

export type OwnProps = Pick<Props, 'metadata'>
export type MapStateProps = Pick<Props, 'project' | 'isLoading' | 'isLoggedIn' | 'isScreenshotReady'>
export type MapDispatchProps = Pick<Props, 'onUpdate' | 'onLogin'>

export enum ShareModalType {
  PROJECT = 'project',
  POOL = 'pool'
}

export type ShareModalMetadata = {
  type: ShareModalType
  id: string
}
