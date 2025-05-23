import { Dispatch } from 'redux'
import { CloseModalAction } from 'decentraland-dapps/dist/modules/modal/actions'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Collection } from 'modules/collection/types'

export enum DeployEntitiesModalView {
  SUCCESS = 'success',
  ERROR = 'error'
}

export type Props = ModalProps & {
  metadata: DeployEntitiesModalMetadata
}

export type MapDispatchProps = Pick<Props, 'onClose'>
export type MapDispatch = Dispatch<CloseModalAction>

export type DeployEntitiesModalMetadata = {
  view: DeployEntitiesModalView
  collection: Collection
  error?: string
}
