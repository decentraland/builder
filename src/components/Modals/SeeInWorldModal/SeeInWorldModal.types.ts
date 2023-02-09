import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'

export type Metadata = { itemIds: string[]; collectionId: never } | { collectionId: string; itemIds: never }

export type Props = Omit<ModalProps, 'metadata'> & {
  metadata: Metadata
}
