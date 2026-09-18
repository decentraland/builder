import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { CreateSingleItemModalMetadata } from '../CreateSingleItemModal/CreateSingleItemModal.types'

export type AddToCollectionModalMetadata = {
  file: File
  prefill?: CreateSingleItemModalMetadata['prefill']
}

export type Props = ModalProps & {
  metadata: AddToCollectionModalMetadata
}
