import { Dispatch } from 'redux'
import { Pool } from 'modules/pool/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { DeploymentStatus } from 'modules/deployment/types'

export type DefaultProps = {
  items: number
}

export type Props = DefaultProps & {
  pool: Pool
  deploymentStatus: DeploymentStatus
  onClick?: (pool: Pool) => any
  onOpenModal: typeof openModal
}

export type OwnProps = Pick<Props, 'pool'>

export type State = {
  isDeleting: boolean
}

export type MapStateProps = Pick<Props, 'items' | 'deploymentStatus'>
export type MapDispatchProps = Pick<Props, 'onOpenModal'>
export type MapDispatch = Dispatch<OpenModalAction>
