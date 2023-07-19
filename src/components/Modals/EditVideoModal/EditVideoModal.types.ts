import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Item } from 'modules/item/types'

export type Props = Omit<ModalProps, 'metadata'> & {
  metadata: EditVideoModalMetadata
}

export type State = {
  video: Blob | null
}

export type EditVideoModalMetadata = {
  onSaveVideo: (video: Blob) => void
  item: Item
}
