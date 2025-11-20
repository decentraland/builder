import React, { createContext, useContext } from 'react'
import { Item, SyncStatus } from 'modules/item/types'
import { State, CreateSingleItemModalMetadata } from './CreateSingleItemModal.types'
import { CreateItemAction } from './CreateSingleItemModal.reducer'
import { Collection } from 'modules/collection/types'

export interface CreateSingleItemModalContextValue {
  // State
  state: State
  collection: Collection | null
  error: string | null
  itemStatus: SyncStatus | null
  metadata: CreateSingleItemModalMetadata
  dispatch: (action: CreateItemAction) => void
  isLoading: boolean

  // Thumbnail handlers
  handleOpenThumbnailDialog: () => void
  handleThumbnailChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  thumbnailInput: React.RefObject<HTMLInputElement>

  // Wearable-specific handlers
  filterItemsByBodyShape: (item: Item) => boolean
  handleItemChange: (item: Item) => void

  // File handling
  handleDropAccepted: (acceptedFileProps: any) => void
  handleOnScreenshotTaken: (screenshot: string) => void

  // Modal handlers
  onClose: () => void
  handleSubmit: () => void
  isDisabled: () => boolean

  // Render functions
  renderMetrics: () => React.ReactNode
  renderModalTitle: () => string
  renderWearablePreview: () => React.ReactNode

  // Flags
  isThirdPartyV2Enabled: boolean
  isAddingRepresentation: boolean
}

export const CreateSingleItemModalContext = createContext<CreateSingleItemModalContextValue | undefined>(undefined)

export const useCreateSingleItemModal = (): CreateSingleItemModalContextValue => {
  const context = useContext(CreateSingleItemModalContext)
  if (context === undefined) {
    throw new Error('useCreateSingleItemModal must be used within a CreateSingleItemModalProvider')
  }
  return context
}
