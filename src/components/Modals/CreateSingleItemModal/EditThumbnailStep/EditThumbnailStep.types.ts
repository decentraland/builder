import { WearablePreviewProps } from 'decentraland-ui'
import { IPreviewController, WearableWithBlobs } from '@dcl/schemas'
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
  DISABLE_AUTOROTATE
}

export type Props = {
  title: string
  isLoading: boolean
  blob?: WearableWithBlobs
  wearablePreviewComponent?: React.ReactNode
  wearablePreviewController?: IPreviewController
  onSave: (screenshot: string) => void
  onBack: () => void
  onClose: () => void
}

export type State = {
  length?: number
  hasBeenUpdated: boolean
  frame: number
  isPlaying: boolean
  playingIntervalId?: NodeJS.Timer
  previewController?: IPreviewController
  blob?: WearableWithBlobs
} & Pick<WearablePreviewProps, 'zoom' | 'disableAutoRotate'>

export type CreateSingleItemModalMetadata = {
  collectionId?: string
  item?: Item
  addRepresentation?: boolean
  changeItemFile?: boolean
}

export type OwnProps = Pick<Props, 'wearablePreviewComponent' | 'wearablePreviewController'>
