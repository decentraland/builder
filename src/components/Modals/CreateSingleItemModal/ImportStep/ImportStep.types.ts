import React from 'react'
import { EmoteCategory, WearableCategory } from '@dcl/schemas'
import { ErrorMessage } from 'components/ItemImport/ErrorMessage/ErrorMessage.types'
import { Item } from 'modules/item/types'
import { AcceptedFileProps } from '../CreateSingleItemModal.types'

export type Props = {
  category?: WearableCategory | EmoteCategory
  metadata?: {
    item: Item
    changeItemFile: boolean
  }
  title: string
  wearablePreviewComponent?: React.ReactNode
  isLoading: boolean
  isRepresentation?: boolean
  isPublishSmartWearablesEnabled?: boolean
  onDropAccepted: (acceptedFileProps: AcceptedFileProps) => void
  onDropRejected?: (files: File[]) => Promise<void>
  onClose: () => void
}

export type StateData = {
  id: string
  error?: ErrorMessage
  isLoading: boolean
}
export type State = Partial<StateData>
