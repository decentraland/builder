import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Project } from 'modules/project/types'
import { PoolGroup } from 'modules/poolGroup/types'
import { shareProject } from 'modules/project/actions'
import { login } from 'modules/auth/actions'
import { shareScene } from 'modules/ui/share/actions'
import { openModal } from 'modules/modal/actions'
import { deployToPoolRequest } from 'modules/deployment/actions'

export type Props = ModalProps & {
  metadata: {}
  error: string | null
  project: Project
  poolGroup: PoolGroup | null,
  isLoading: boolean
  isLoggedIn: boolean
  isReady: boolean
  isSubmitting: boolean
  progress: number
  onOpenModal: typeof openModal
  onUpdate: typeof shareProject
  onLogin: typeof login
  onShare: typeof shareScene
  onDeployToPool: typeof deployToPoolRequest
}

export type OwnProps = Pick<Props, 'metadata'>
export type MapStateProps = Pick<Props, 'error' | 'project' | 'poolGroup' | 'isLoading' | 'isLoggedIn' | 'isReady' | 'progress' | 'isSubmitting'>
export type MapDispatchProps = Pick<Props, 'onUpdate' | 'onLogin' | 'onShare' | 'onOpenModal' | 'onDeployToPool'>

export type State = {
  isSuccess: boolean
  ethAddress?: string
  hasEthAddressError: boolean
}
