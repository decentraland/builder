import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Project } from 'modules/project/types'
import { setUserProfile } from 'modules/user/actions'
import { deployToPoolRequest } from 'modules/deployment/actions'
import { editProjectRequest } from 'modules/project/actions'

export type Props = ModalProps & {
  currentProject: Project | null
  userEthAddress: string
  userEmail: string
  error: string | null
  isLoading: boolean
  deploymentThumbnail: string | null
  onDeployToPool: typeof deployToPoolRequest
  onSaveProject: typeof editProjectRequest
  onSaveUser: typeof setUserProfile
}

export type State = {
  email: string
  ethAddress: string
  project: Project
  isSubmitting: boolean
  isSuccess: boolean
}

export type Step = {
  thumbnail: string
  description: string
}

export type MapStateProps = Pick<Props, 'currentProject' | 'userEmail' | 'userEthAddress' | 'error' | 'deploymentThumbnail' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onDeployToPool' | 'onSaveUser' | 'onSaveProject'>
