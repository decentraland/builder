import { DomainState } from './types'
import { InitAction, INIT, RemoveAction, REMOVE } from './actions'
import { removeElement } from './utils'

export const INITIAL_STATE: DomainState = {
  localIds: []
}

export type ReducerAction = InitAction | RemoveAction

export function domainReducer(state: DomainState = INITIAL_STATE, action: ReducerAction): DomainState {
  switch (action.type) {
    case INIT: {
      const { localIds } = action.payload
      return {
        ...state,
        localIds
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
