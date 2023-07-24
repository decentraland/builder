import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Item } from 'modules/item/types'

export type Props = Omit<ModalProps, 'metadata'> & {
  metadata: EditVideoModalMetadata
}

export type State = {
  video: Blob | null
  view: string
}

export type EditVideoModalMetadata = {
  onSaveVideo: (video: Blob) => void
  item: Item
  view?: EditVideoView
}

export enum EditVideoView {
  VIEW_VIDEO = 'view_video',
  UPLOAD_VIDEO = 'upload_video'
}
