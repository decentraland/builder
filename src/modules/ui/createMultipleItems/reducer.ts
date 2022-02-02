import {
  CancelSaveMultipleItemsAction,
  ClearStateSaveMultipleItemsAction,
  SaveMultipleItemsCancelledAction,
  SaveMultipleItemsFailureAction,
  SaveMultipleItemsRequestAction,
  SaveMultipleItemsSuccessAction,
  SAVE_MULTIPLE_ITEMS_CANCELLED,
  SAVE_MULTIPLE_ITEMS_CLEAR_STATE,
  SAVE_MULTIPLE_ITEMS_FAILURE,
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
  progress: number
}

export const INITIAL_STATE: CreateMultipleItemsState = {
  state: MultipleItemsSaveState.NOT_STARTED,
  progress: 0,
  savedItemsFiles: []
}

type CreateMultipleItemsReducerAction =
  | ClearStateSaveMultipleItemsAction
  | CancelSaveMultipleItemsAction
  | SaveMultipleItemsRequestAction
  | SaveMultipleItemsSuccessAction
  | SaveMultipleItemsFailureAction
  | SaveMultipleItemsCancelledAction
  | UpdateProgressSaveMultipleItemsAction

export const createMultipleItemsReducer = (state = INITIAL_STATE, action: CreateMultipleItemsReducerAction): CreateMultipleItemsState => {
  switch (action.type) {
    case SAVE_MULTIPLE_ITEMS_CLEAR_STATE: {
      return INITIAL_STATE
    }
    case SAVE_MULTIPLE_ITEMS_CANCELLED: {
      const { fileNames } = action.payload

      return {
        ...state,
        savedItemsFiles: fileNames,
        state: MultipleItemsSaveState.CANCELLED
      }
    }
    case SAVE_MULTIPLE_ITEMS_REQUEST: {
      return {
        ...state,
        state: MultipleItemsSaveState.UPLOADING
      }
    }
    case SAVE_MULTIPLE_ITEMS_FAILURE: {
      const { fileNames } = action.payload

      return {
        ...state,
        savedItemsFiles: fileNames,
        state: MultipleItemsSaveState.FINISHED_UNSUCCESSFULLY
      }
    }
    case SAVE_MULTIPLE_ITEMS_SUCCESS: {
      const { fileNames } = action.payload

      return {
        ...state,
        savedItemsFiles: fileNames,
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
