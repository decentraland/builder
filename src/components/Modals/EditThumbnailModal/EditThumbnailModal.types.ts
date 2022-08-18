import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'

export type Props = ModalProps & {
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
}
