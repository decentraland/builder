import { LocationChangeAction, LOCATION_CHANGE } from 'connected-react-router'

export type LocationState = {
  hasHistory: boolean
}

const INITIAL_STATE: LocationState = {
  hasHistory: false
}

export type LocationReducerAction = LocationChangeAction

export function locationReducer(state = INITIAL_STATE, action: LocationReducerAction) {
  switch (action.type) {
    case LOCATION_CHANGE: {
      return {
        ...state,
        hasHistory: !action.payload.isFirstRendering
      }
    }
    default:
      return state
  }
}
