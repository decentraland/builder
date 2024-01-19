import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Deployment } from 'modules/deployment/types'
import { PoolGroup } from 'modules/poolGroup/types'
import { Project } from 'modules/project/types'
import { Scene } from 'modules/scene/types'

export type Props = ModalProps & {
  deployment: Deployment
  metadata: DeployModalMetadata
  currentPoolGroup: PoolGroup | null
  project: Project | null
  scene: Scene | null
}

export type State = {
  view: DeployModalView
  deploymentId: string | null
  claimedName: string | null
}

export type Step = {
  thumbnail: string
  description: string
}

export type OwnProps = Pick<Props, 'metadata'>
export type MapStateProps = Pick<Props, 'deployment' | 'currentPoolGroup' | 'project' | 'scene'>

export enum DeployModalView {
  NONE = 'NONE',
  CLEAR_DEPLOYMENT = 'CLEAR_DEPLOYMENT',
  DEPLOY_TO_LAND = 'DEPLOY_TO_LAND',
  DEPLOY_TO_POOL = 'DEPLOY_TO_POOL',
  DEPLOY_TO_WORLD = 'DEPLOY_TO_WORLD'
}

export type DeployModalMetadata = {
  view: DeployModalView
  deploymentId?: string
  claimedName?: string
}
