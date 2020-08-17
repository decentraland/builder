import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Deployment } from 'modules/deployment/types'
import { PoolGroup } from 'modules/poolGroup/types'

export type Props = ModalProps & {
  deployment: Deployment
  metadata: DeployModalMetadata
  currentPoolGroup: PoolGroup | null
}

export type State = {
  view: DeployModalView
  deploymentId: string | null
}

export type Step = {
  thumbnail: string
  description: string
}

export type OwnProps = Pick<Props, 'metadata'>
export type MapStateProps = Pick<Props, 'deployment' | 'currentPoolGroup'>
export type MapDispatchProps = {}

export enum DeployModalView {
  NONE = 'NONE',
  CLEAR_DEPLOYMENT = 'CLEAR_DEPLOYMENT',
  DEPLOY_TO_LAND = 'DEPLOY_TO_LAND',
  DEPLOY_TO_POOL = 'DEPLOY_TO_POOL'
}

export type DeployModalMetadata = {
  view: DeployModalView
  deploymentId?: string
}
