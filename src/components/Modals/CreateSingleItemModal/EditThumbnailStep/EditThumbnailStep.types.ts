import React from 'react'
import { EmoteWithBlobs, IPreviewController } from '@dcl/schemas'
import { SocialEmoteAnimation } from '@dcl/schemas/dist/dapps/preview/social-emote-animation'
import { Item } from 'modules/item/types'

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
  previewController?: IPreviewController
  blob?: EmoteWithBlobs
  socialEmote?: SocialEmoteAnimation
}

export type CreateSingleItemModalMetadata = {
  collectionId?: string
  item?: Item
  addRepresentation?: boolean
  changeItemFile?: boolean
}

export type OwnProps = Pick<Props, 'wearablePreviewComponent' | 'wearablePreviewController'>
