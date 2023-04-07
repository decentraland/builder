import { EmoteWithBlobs, WearableWithBlobs } from '@dcl/schemas'
import { ItemType } from 'modules/item/types'

export enum CreateItemView {
  IMPORT = 'import',
  DETAILS = 'details',
  THUMBNAIL = 'thumbnail'
}

export enum ControlOptionAction {
  ZOOM_IN,
  ZOOM_OUT,
  PAN_CAMERA_Y,
  CHANGE_CAMERA_ALPHA
}

export type Props = {
  title: string
  isLoading: boolean
  type?: ItemType
  blob?: WearableWithBlobs | EmoteWithBlobs
  base64s?: string[]
  onSave: (screenshot: string) => void
  onBack: () => void
  onClose: () => void
}

export type State = {
  hasBeenUpdated: boolean
  blob?: WearableWithBlobs | EmoteWithBlobs
}
