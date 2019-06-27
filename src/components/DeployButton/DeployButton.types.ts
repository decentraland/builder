import { Dispatch } from 'redux'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { DeploymentStatus, Deployment } from 'modules/deployment/types'

export type Props = {
  isDisabled: boolean
  deployment: Deployment | null
  deploymentStatus: DeploymentStatus
  onOpenModal: typeof openModal
  onClick: () => void
}

export type DefaultProps = Pick<Props, 'isDisabled' | 'onClick'>

export type MapStateProps = Pick<Props, 'deployment' | 'deploymentStatus'>

export type MapDispatchProps = Pick<Props, 'onOpenModal'>

export type MapDispatch = Dispatch<OpenModalAction>
