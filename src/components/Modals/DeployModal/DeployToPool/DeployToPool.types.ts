import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Project } from 'modules/project/types'
import { setUserProfile } from 'modules/user/actions'
import { deployToPoolRequest } from 'modules/deployment/actions'
import { editProjectRequest } from 'modules/project/actions'
import { DeploymentState } from 'modules/deployment/reducer'

export type Props = {
  currentProject: Project | null
  userEthAddress: string
  userEmail: string
  error: string | null
  isLoading: boolean
  progress: number
  isRecording: boolean
  isUploadingRecording: boolean
  images: DeploymentState['data']['images']
  onDeployToPool: typeof deployToPoolRequest
  onSaveProject: typeof editProjectRequest
  onSaveUser: typeof setUserProfile
  onClose: ModalProps['onClose']
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

export type MapStateProps = Pick<
  Props,
  'currentProject' | 'isRecording' | 'isUploadingRecording' | 'userEmail' | 'userEthAddress' | 'error' | 'images' | 'isLoading' | 'progress'
>
export type MapDispatchProps = Pick<Props, 'onDeployToPool' | 'onSaveUser' | 'onSaveProject'>
