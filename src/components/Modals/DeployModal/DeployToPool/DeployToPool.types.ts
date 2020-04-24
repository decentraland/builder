import { Dispatch } from 'redux'
import { Project } from 'modules/project/types'
import { deployToPoolRequest, DeployToPoolRequestAction } from 'modules/deployment/actions'
import { Media } from 'modules/media/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { LoginRequestAction, loginRequest } from 'modules/identity/actions'

export type Props = {
  name: string
  project: Project | null
  error: string | null
  isLoading: boolean
  isReady: boolean
  progress: number
  isRecording: boolean
  isLoggedIn: boolean
  isUploadingRecording: boolean
  media: Media | null
  onDeployToPool: typeof deployToPoolRequest
  onOpenModal: typeof openModal
  onLogin: typeof loginRequest
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
  'project' | 'isRecording' | 'isLoading' | 'isReady' | 'isUploadingRecording' | 'error' | 'media' | 'progress' | 'isLoggedIn'
>
export type MapDispatchProps = Pick<Props, 'onDeployToPool' | 'onLogin' | 'onOpenModal'>
export type MapDispatch = Dispatch<DeployToPoolRequestAction | LoginRequestAction | OpenModalAction>
