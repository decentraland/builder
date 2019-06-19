import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Project } from 'modules/project/types'
import { setUserProfile } from 'modules/user/actions'
import { deployToPoolRequest } from 'modules/deployment/actions'
import { editProjectRequest } from 'modules/project/actions'
import { Media } from 'modules/media/types'

export type Props = {
  currentProject: Project | null
  userEmail: string
  error: string | null
  isLoading: boolean
  progress: number
  isRecording: boolean
  isUploadingRecording: boolean
  media: Media | null
  ethAddress: string | undefined
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
  'currentProject' | 'isRecording' | 'isLoading' | 'isUploadingRecording' | 'userEmail' | 'error' | 'media' | 'ethAddress' | 'progress'
>
export type MapDispatchProps = Pick<Props, 'onDeployToPool' | 'onSaveUser' | 'onSaveProject'>
