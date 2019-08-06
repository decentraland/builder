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
  AddLocalAction,
  ADD_LOCAL
} from './actions'
import { addElement, removeElement, addEntry, removeEntry } from './utils'

export const INITIAL_STATE: DomainState = {
  localIds: [],
  loadingIds: [],
  errorsById: {}
}

export type ReducerAction = InitAction | RequestAction | SuccessAction | FailureAction | AddLocalAction

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
        loadingIds: removeElement(state.loadingIds, id),
        localIds: removeElement(state.localIds, id),
        errorsById: removeEntry(state.errorsById, id)
      }
    }
    case FAILURE: {
      const { id, error } = action.payload
      return {
        ...state,
        errorsById: addEntry(state.errorsById, id, error),
        localIds: addElement(state.loadingIds, id)
      }
    }
    case ADD_LOCAL: {
      const { id } = action.payload
      return {
        ...state,
        localIds: addElement(state.localIds, id)
      }
    }
  }
}
