import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'

export type Props = ModalProps & {
  metadata: DeployModalMetadata
}

export enum DeployModalView {
  CLEAR_DEPLOYMENT = 'CLEAR_DEPLOYMENT'
}

export type DeployModalMetadata = {
  view: DeployModalView
  deploymentId: string
}
