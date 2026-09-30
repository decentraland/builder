import { DomainState } from './types'
import { InitAction, INIT, CreateAction, CREATE, RemoveAction, REMOVE } from './actions'
import { addElement, removeElement } from './utils'

export const INITIAL_STATE: DomainState = {
  localIds: []
}

export type ReducerAction = InitAction | CreateAction | RemoveAction

export function domainReducer(state: DomainState = INITIAL_STATE, action: ReducerAction): DomainState {
  switch (action.type) {
    case INIT: {
      const { localIds } = action.payload
      return {
        ...state,
        localIds
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
        localIds: removeElement(state.localIds, id)
      }
    }
  }
}
