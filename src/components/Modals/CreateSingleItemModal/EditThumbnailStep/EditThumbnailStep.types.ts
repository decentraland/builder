import { EmoteWithBlobs, IPreviewController } from '@dcl/schemas'
import { Item } from 'modules/item/types'
import React from 'react'

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
  blob?: EmoteWithBlobs
  base64s?: string[]
  wearablePreviewComponent?: React.ReactNode
  wearablePreviewController?: IPreviewController
  onSave: (screenshot: string) => void
  onBack: () => void
  onClose: () => void
}

export type State = {
  hasBeenUpdated: boolean
  playingIntervalId?: ReturnType<typeof setTimeout>
  previewController?: IPreviewController
  blob?: EmoteWithBlobs
  zoom: number
  offsetY?: number
}

export type CreateSingleItemModalMetadata = {
  collectionId?: string
  item?: Item
  addRepresentation?: boolean
  changeItemFile?: boolean
}

export type OwnProps = Pick<Props, 'wearablePreviewComponent' | 'wearablePreviewController'>
