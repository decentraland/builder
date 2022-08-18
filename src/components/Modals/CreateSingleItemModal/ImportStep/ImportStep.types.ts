import React from 'react'
import { WearableCategory } from '@dcl/schemas'
import { Item } from 'modules/item/types'
import { AcceptedFileProps } from '../CreateSingleItemModal.types'

export type Props = {
  category?: WearableCategory
  metadata?: CreateSingleItemModalMetadata
  title: string
  wearablePreviewComponent?: React.ReactNode
  isLoading: boolean
  isRepresentation?: boolean
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

export type CreateSingleItemModalMetadata = {
  collectionId?: string
  item?: Item
  addRepresentation?: boolean
  changeItemFile?: boolean
}
