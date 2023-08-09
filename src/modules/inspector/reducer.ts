import { ToggleScreenshotAction, TOGGLE_SCREENSHOT } from './actions'

export type InspectorState = {
  screenshotEnabled: boolean
}

const INITIAL_STATE: InspectorState = {
  screenshotEnabled: true
}

type InspectorReducerAction = ToggleScreenshotAction

export function inspectorReducer(state = INITIAL_STATE, action: InspectorReducerAction) {
  switch (action.type) {
    case TOGGLE_SCREENSHOT: {
      return {
        ...state,
        screenshotEnabled: action.payload.enabled
      }
    }
    default:
      return state
  }
}
