import { SaveProjectSuccessAction, SAVE_PROJECT_SUCCESS } from 'modules/sync/actions'
import { DismissSignInToastAction, DismissSyncedToastAction, DISMISS_SYNCED_TOAST, DISMISS_SIGN_IN_TOAST } from './actions'

export type DashboardState = {
  didSync: boolean
  didDismissSyncedToast: boolean
  didDismissSignInToast: boolean
}

const INITIAL_STATE: DashboardState = {
  didSync: false,
  didDismissSyncedToast: false,
  didDismissSignInToast: false
}

type DashboardReducerAction = SaveProjectSuccessAction | DismissSignInToastAction | DismissSyncedToastAction

export const dashboardReducer = (state = INITIAL_STATE, action: DashboardReducerAction): DashboardState => {
  switch (action.type) {
    case SAVE_PROJECT_SUCCESS: {
      return { ...state, didSync: true }
    }
    case DISMISS_SYNCED_TOAST: {
      return {
        ...state,
        didDismissSyncedToast: true
      }
    }
    case DISMISS_SIGN_IN_TOAST: {
      return {
        ...state,
        didDismissSignInToast: true
      }
    }
    default:
      return state
  }
}
