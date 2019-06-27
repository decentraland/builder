import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'

export type Props = ModalProps & {}

export type State = {
  view: DeployModalView
}

export type Step = {
  thumbnail: string
  description: string
}

export type MapStateProps = {}
export type MapDispatchProps = {}

export enum DeployModalView {
  NONE,
  CLEAR_DEPLOYMENT,
  DEPLOY_TO_LAND,
  DEPLOY_TO_POOL
}
