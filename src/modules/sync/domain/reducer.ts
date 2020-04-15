import { DomainState } from './types'
import {
  InitAction,
  RequestAction,
  SuccessAction,
  FailureAction,
  INIT,
  REQUEST,
  SUCCESS,
  FAILURE,
  CreateAction,
  CREATE,
  RemoveAction,
  REMOVE
} from './actions'
import { addElement, removeElement, addEntry, removeEntry } from './utils'

export const INITIAL_STATE: DomainState = {
  localIds: [],
  loadingIds: [],
  errorsById: {}
}

export type ReducerAction = InitAction | RequestAction | SuccessAction | FailureAction | CreateAction | RemoveAction

export function domainReducer(state: DomainState = INITIAL_STATE, action: ReducerAction): DomainState {
  switch (action.type) {
    case INIT: {
      const { localIds } = action.payload
      return {
        ...state,
        localIds
      }
    }
    case REQUEST: {
      const { id } = action.payload
      return {
        ...state,
        loadingIds: addElement(state.loadingIds, id)
      }
    }
    case SUCCESS: {
      const { id } = action.payload
      return {
        ...state,
        localIds: removeElement(state.localIds, id),
        loadingIds: removeElement(state.loadingIds, id),
        errorsById: removeEntry(state.errorsById, id)
      }
    }
    case FAILURE: {
      const { id, error } = action.payload
      return {
        ...state,
        localIds: addElement(state.localIds, id),
        loadingIds: removeElement(state.loadingIds, id),
        errorsById: addEntry(state.errorsById, id, error)
      }
    }
    case CREATE: {
      const { id } = action.payload
      return {
        ...state,
        localIds: addElement(state.localIds, id)
      }
    }
    case REMOVE: {
      const { id } = action.payload
      return {
        ...state,
        localIds: removeElement(state.localIds, id),
        loadingIds: removeElement(state.loadingIds, id),
        errorsById: removeEntry(state.errorsById, id)
      }
    }
  }
}
