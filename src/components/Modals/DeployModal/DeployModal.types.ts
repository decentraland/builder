import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Project } from 'modules/project/types'

export type Props = ModalProps & {
  currentProject: Project | null
  userEthAddress: string
  userEmail: string
  error: string | null
  isLoading: boolean
  onSetEmail: (email: string) => void
  onPublishToPool: (projectId: string, email: string, ethAddress: string) => void
  onSaveProject: (projectId: string, project: Project) => void
  onSaveUser: (email: string, ethAddress: string) => void
}

export type State = {
  isLoading: boolean
  email: string
  ethAddress: string
  project: Project
}

export type Step = {
  thumbnail: string
  description: string
}

export type MapStateProps = Pick<Props, 'currentProject' | 'userEmail' | 'userEthAddress' | 'error' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onSetEmail'>
