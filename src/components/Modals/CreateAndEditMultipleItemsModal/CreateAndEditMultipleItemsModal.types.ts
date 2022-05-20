import { Dispatch } from 'redux'
import { Content } from '@dcl/builder-client'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import {
  SaveMultipleItemsRequestAction,
  CancelSaveMultipleItemsAction,
  ClearStateSaveMultipleItemsAction,
  cancelSaveMultipleItems,
  saveMultipleItemsRequest,
  clearSaveMultipleItems
} from 'modules/item/actions'
import {
  getSavedItemsFiles,
  getNotSavedItemsFiles,
  getCanceledItemsFiles,
  getMultipleItemsSaveState
} from 'modules/ui/createMultipleItems/selectors'
import { BuiltFile } from 'modules/item/types'
import { Collection } from 'modules/collection/types'

export enum CreateOrEditMultipleItemsModalType {
  CREATE,
  EDIT
}

export enum LoadingFilesState {
  LOADING_FILES,
  CREATING_ITEMS
}
export enum ItemCreationView {
  IMPORT,
  IMPORTING,
  REVIEW,
  UPLOADING,
  COMPLETED
}
export enum ImportedFileType {
  ACCEPTED,
  REJECTED
}

export type RejectedFile = { fileName: string; reason: string }
export type ImportedFile<T extends Content> = { type: ImportedFileType } & (BuiltFile<T> | RejectedFile)
export type CreateAndEditMultipleItemsModalMetadata = {
  collectionId?: string
  type?: CreateOrEditMultipleItemsModalType
}

export type State = {
  view: ItemCreationView
  loadingFilesProgress: number
  importedFiles: Record<string, ImportedFile<Blob>>
}

export type Props = Omit<ModalProps, 'metadata'> & {
  collection: Collection | null
  error: string | null
  onSaveMultipleItems: typeof saveMultipleItemsRequest
  onCancelSaveMultipleItems: typeof cancelSaveMultipleItems
  onModalUnmount: typeof clearSaveMultipleItems
  savedItemsFiles: ReturnType<typeof getSavedItemsFiles>
  notSavedItemsFiles: ReturnType<typeof getNotSavedItemsFiles>
  cancelledItemsFiles: ReturnType<typeof getCanceledItemsFiles>
  saveMultipleItemsState: ReturnType<typeof getMultipleItemsSaveState>
  saveItemsProgress: number
  metadata: CreateAndEditMultipleItemsModalMetadata
}

export type OwnProps = Pick<Props, 'name' | 'metadata' | 'onClose'>
export type MapStateProps = Pick<
  Props,
  'savedItemsFiles' | 'notSavedItemsFiles' | 'cancelledItemsFiles' | 'error' | 'saveMultipleItemsState' | 'saveItemsProgress' | 'collection'
>
export type MapDispatchProps = Pick<Props, 'onSaveMultipleItems' | 'onCancelSaveMultipleItems' | 'onModalUnmount'>
export type MapDispatch = Dispatch<SaveMultipleItemsRequestAction | CancelSaveMultipleItemsAction | ClearStateSaveMultipleItemsAction>
