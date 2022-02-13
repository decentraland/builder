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
import { getSavedItemsFiles, getMultipleItemsSaveState } from 'modules/ui/createMultipleItems/selectors'
import { BuiltFile } from 'modules/item/types'
import { Collection } from 'modules/collection/types'

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
export type CreateMultipleItemsModalMetadata = {
  collectionId?: string
}

export type State = {
  view: ItemCreationView
  loadingFilesProgress: number
  importedFiles: Record<string, ImportedFile<Blob>>
}

export type Props = ModalProps & {
  collection: Collection
  error: string | null
  onSaveMultipleItems: typeof saveMultipleItemsRequest
  onCancelSaveMultipleItems: typeof cancelSaveMultipleItems
  onModalUnmount: typeof clearSaveMultipleItems
  savedItemsFiles: ReturnType<typeof getSavedItemsFiles>
  saveMultipleItemsState: ReturnType<typeof getMultipleItemsSaveState>
  saveItemsProgress: number
}

export type OwnProps = Pick<Props, 'name' | 'metadata' | 'onClose'>
export type MapStateProps = Pick<Props, 'savedItemsFiles' | 'error' | 'saveMultipleItemsState' | 'saveItemsProgress' | 'collection'>
export type MapDispatchProps = Pick<Props, 'onSaveMultipleItems' | 'onCancelSaveMultipleItems' | 'onModalUnmount'>
export type MapDispatch = Dispatch<SaveMultipleItemsRequestAction | CancelSaveMultipleItemsAction | ClearStateSaveMultipleItemsAction>
