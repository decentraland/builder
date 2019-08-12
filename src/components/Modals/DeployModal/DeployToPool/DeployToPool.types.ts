import { Project } from 'modules/project/types'
import { deployToPoolRequest } from 'modules/deployment/actions'
import { Media } from 'modules/media/types'
import { login } from 'modules/auth/actions'

export type Props = {
  name: string
  project: Project | null
  email: string | null
  error: string | null
  isLoading: boolean
  progress: number
  isRecording: boolean
  isLoggedIn: boolean
  isUploadingRecording: boolean
  media: Media | null
  onDeployToPool: typeof deployToPoolRequest
  onLogin: typeof login
  onClose: () => void
}

export type State = {
  isSubmitting: boolean
  isSuccess: boolean
}

export type Step = {
  thumbnail: string
  description: string
}

export type MapStateProps = Pick<
  Props,
  'project' | 'isRecording' | 'isLoading' | 'isUploadingRecording' | 'email' | 'error' | 'media' | 'progress' | 'isLoggedIn'
>
export type MapDispatchProps = Pick<Props, 'onDeployToPool' | 'onLogin'>
