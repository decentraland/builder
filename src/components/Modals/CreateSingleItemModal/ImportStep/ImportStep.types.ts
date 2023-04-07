import React from 'react'
import { EmoteCategory, WearableCategory } from '@dcl/schemas'
import { AcceptedFileProps } from '../CreateSingleItemModal.types'
import { Item } from 'modules/item/types'

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
  isTPCollection?: boolean
  onDropAccepted: (acceptedFileProps: AcceptedFileProps) => void
  onDropRejected?: (files: File[]) => Promise<void>
  onClose: () => void
}

export type StateData = {
  id: string
  error: string
  isLoading: boolean
}
export type State = Partial<StateData>
