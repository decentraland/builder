import { BuiltItem } from '@dcl/builder-client'

export enum LoadingFilesState {
  LOADING_FILES,
  CREATING_ITEMS
}

export enum ItemCreationView {
  IMPORT,
  LOADING,
  REVIEW,
  UPLOAD
}

export type State = {
  items: BuiltItem<Blob>[]
  view: ItemCreationView
  loadingFilesState: LoadingFilesState
  loadingFilesProgress: number
}
