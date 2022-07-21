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

export type Props = {
  title: string
  blob?: WearableWithBlobs
  wearablePreviewComponent?: React.ReactNode
  wearablePreviewController?: IPreviewController
  onScreenshot: (screenshot: string) => void
  onBack: () => void
  onClose: () => void
}

export type State = {
  previewController?: IPreviewController
  length?: number
  hasBeenUpdated: boolean
  frame: number,
  isPlaying: boolean,
} & Pick<WearablePreviewProps, 'zoom'>

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
