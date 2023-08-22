import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'

export type Props = Omit<ModalProps, 'metadata'> & {
  metadata: EditThumbnailModalMetadata
}

export type State = {
  view: string
  file: File | null
  error: string
  isLoading: boolean
}

export type EditThumbnailModalMetadata = {
  onSaveThumbnail: (thumbnail: string) => void
  item: Item
  collection: Collection
}
