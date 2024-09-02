import { SAVE_LAST_LOCATION, SaveLastLocationAction } from './action'

export type LocationState = {
  lastLocation?: string
}

export const INITIAL_STATE: LocationState = {
  lastLocation: undefined
}

export function locationReducer(state = INITIAL_STATE, action: SaveLastLocationAction) {
  switch (action.type) {
    case SAVE_LAST_LOCATION: {
      return {
        ...state,
        lastLocation: action.payload.location
      }
    }
    default:
      return state
  }
}
