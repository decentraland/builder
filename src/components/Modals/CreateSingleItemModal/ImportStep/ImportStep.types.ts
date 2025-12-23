import React from 'react'
import { EmoteCategory, WearableCategory } from '@dcl/schemas'
import { ErrorMessage } from 'components/ItemImport/ErrorMessage/ErrorMessage.types'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'
import { AcceptedFileProps } from '../CreateSingleItemModal.types'

export type Props = {
  collection: Collection | null
  category?: WearableCategory | EmoteCategory
  metadata?: {
    item: Item
    changeItemFile: boolean
  }
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
  error?: ErrorMessage | React.ReactNode
  isLoading: boolean
}
export type State = Partial<StateData>
