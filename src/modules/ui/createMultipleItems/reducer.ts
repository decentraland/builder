import {
  CancelSaveMultipleItemsAction,
  ClearStateSaveMultipleItemsAction,
  SaveMultipleItemsCancelledAction,
  SaveMultipleItemsRequestAction,
  SaveMultipleItemsSuccessAction,
  SAVE_MULTIPLE_ITEMS_CANCELLED,
  CLEAR_SAVE_MULTIPLE_ITEMS,
  SAVE_MULTIPLE_ITEMS_REQUEST,
  SAVE_MULTIPLE_ITEMS_SUCCESS
} from 'modules/item/actions'
import { SAVE_MULTIPLE_ITEMS_UPDATE_PROGRESS, UpdateProgressSaveMultipleItemsAction } from './action'

export enum MultipleItemsSaveState {
  NOT_STARTED,
  UPLOADING,
  CANCELLED,
  FINISHED_UNSUCCESSFULLY,
  FINISHED_SUCCESSFULLY
}

export type CreateMultipleItemsState = {
  state: MultipleItemsSaveState
  savedItemsFiles: string[]
  notSavedItemsFiles: string[]
  cancelledItemFiles: string[]
  progress: number
}

export const INITIAL_STATE: CreateMultipleItemsState = {
  state: MultipleItemsSaveState.NOT_STARTED,
  progress: 0,
  savedItemsFiles: [],
  notSavedItemsFiles: [],
  cancelledItemFiles: []
}

type CreateMultipleItemsReducerAction =
  | ClearStateSaveMultipleItemsAction
  | CancelSaveMultipleItemsAction
  | SaveMultipleItemsRequestAction
  | SaveMultipleItemsSuccessAction
  | SaveMultipleItemsCancelledAction
  | UpdateProgressSaveMultipleItemsAction

export const createMultipleItemsReducer = (state = INITIAL_STATE, action: CreateMultipleItemsReducerAction): CreateMultipleItemsState => {
  switch (action.type) {
    case CLEAR_SAVE_MULTIPLE_ITEMS: {
      return INITIAL_STATE
    }
    case SAVE_MULTIPLE_ITEMS_CANCELLED: {
      const { savedFileNames, notSavedFileNames, cancelledFileNames } = action.payload

      return {
        ...state,
        savedItemsFiles: savedFileNames,
        notSavedItemsFiles: notSavedFileNames,
        cancelledItemFiles: cancelledFileNames,
        state: MultipleItemsSaveState.CANCELLED
      }
    }
    case SAVE_MULTIPLE_ITEMS_REQUEST: {
      return {
        ...state,
        state: MultipleItemsSaveState.UPLOADING
      }
    }
    case SAVE_MULTIPLE_ITEMS_SUCCESS: {
      const { savedFileNames, notSavedFileNames } = action.payload

      return {
        ...state,
        savedItemsFiles: savedFileNames,
        notSavedItemsFiles: notSavedFileNames,
        state: MultipleItemsSaveState.FINISHED_SUCCESSFULLY
      }
    }
    case SAVE_MULTIPLE_ITEMS_UPDATE_PROGRESS: {
      const { progress } = action.payload

      return {
        ...state,
        progress
      }
    }
    default:
      return state
  }
}
