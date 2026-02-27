import { LOCATION_CHANGE, LocationChangeAction } from 'modules/location/actions'

export type LocationState = {
  currentLocation?: string
  lastLocation?: string
}

export const INITIAL_STATE: LocationState = {
  currentLocation: undefined,
  lastLocation: undefined
}

export function locationReducer(state = INITIAL_STATE, action: LocationChangeAction): LocationState {
  switch (action.type) {
    case LOCATION_CHANGE: {
      return {
        ...state,
        lastLocation: state.currentLocation,
        currentLocation: action.payload.location.pathname
      }
    }
    default:
      return state
  }
}
