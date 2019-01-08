import { LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { AnyComponent } from './types'
import { AddComponentAction, ADD_COMPONENT } from './actions'

export type ComponentReducerAction = AddComponentAction

export type ComponentState = {
  data: Record<string, AnyComponent>
  loading: LoadingState
  error: string | null
}

const INITIAL_STATE: ComponentState = {
  data: {},
  loading: [],
  error: null
}

export const componentReducer = (state: ComponentState = INITIAL_STATE, action: ComponentReducerAction): ComponentState => {
  switch (action.type) {
    case ADD_COMPONENT: {
      const { component } = action.payload

      return {
        ...state,
        data: {
          ...state.data,
          [component.id]: component
        }
      }
    }

    default:
      return state
  }
}
