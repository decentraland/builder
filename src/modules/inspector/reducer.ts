import { SetInspectorReloadingAction, SET_INSPECTOR_RELOADING, ToggleScreenshotAction, TOGGLE_SCREENSHOT } from './actions'

export type InspectorState = {
  screenshotEnabled: boolean
  isReloading: boolean
}

const INITIAL_STATE: InspectorState = {
  screenshotEnabled: true,
  isReloading: false
}

type InspectorReducerAction = ToggleScreenshotAction | SetInspectorReloadingAction

export function inspectorReducer(state = INITIAL_STATE, action: InspectorReducerAction): InspectorState {
  switch (action.type) {
    case TOGGLE_SCREENSHOT: {
      return {
        ...state,
        screenshotEnabled: action.payload.enabled
      }
    }
    case SET_INSPECTOR_RELOADING: {
      return {
        ...state,
        isReloading: action.payload.value
      }
    }
    default:
      return state
  }
}
