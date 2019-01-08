import { LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { EntityDefinition } from './types'
import { AddEntityAction, ADD_ENTITY } from './actions'

export type EntityReducerAction = AddEntityAction

export type EntityState = {
  data: Record<string, EntityDefinition>
  loading: LoadingState
  error: string | null
}

const INITIAL_STATE: EntityState = {
  data: {},
  loading: [],
  error: null
}

export const entityReducer = (state: EntityState = INITIAL_STATE, action: EntityReducerAction): EntityState => {
  switch (action.type) {
    case ADD_ENTITY: {
      const { entity } = action.payload

      return {
        ...state,
        data: {
          ...state.data,
          [entity.id]: entity
        }
      }
    }

    default:
      return state
  }
}
