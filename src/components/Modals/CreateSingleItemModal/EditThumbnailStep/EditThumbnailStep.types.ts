import { Dispatch } from 'redux'
import { WearablePreviewProps } from 'decentraland-ui'
import { IPreviewController, WearableWithBlobs } from '@dcl/schemas'
import { SaveItemRequestAction } from 'modules/item/actions'
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

export type SortedContent = { male: Record<string, Blob>; female: Record<string, Blob>; all: Record<string, Blob> }

export type OwnProps = Pick<Props, 'wearablePreviewComponent' | 'wearablePreviewController'>
// export type MapStateProps = Pick<Props, 'address' | 'error' | 'isLoading' | 'collection' | 'isEmotesFeatureFlagOn'>
// export type MapDispatchProps = Pick<Props, 'onSave'>
export type MapDispatch = Dispatch<SaveItemRequestAction>
