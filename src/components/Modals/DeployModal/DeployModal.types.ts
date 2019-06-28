import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Deployment } from 'modules/deployment/types'

export type Props = ModalProps & {
  deployment: Deployment | null
}

export type State = {
  view: DeployModalView
}

export type Step = {
  thumbnail: string
  description: string
}

export type MapStateProps = Pick<Props, 'deployment'>
export type MapDispatchProps = {}

export enum DeployModalView {
  NONE,
  CLEAR_DEPLOYMENT,
  DEPLOY_TO_LAND,
  DEPLOY_TO_POOL
}
