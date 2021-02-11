import {
  DismissSignInToastAction,
  DismissSyncedToastAction,
  DISMISS_SYNCED_TOAST,
  DISMISS_SIGN_IN_TOAST,
  SetSyncAction,
  SET_SYNC
} from './actions'
import { CREATE_PROJECT, CreateProjectAction } from 'modules/project/actions'

export type DashboardState = {
  didCreate: boolean
  didSync: boolean
  didDismissSyncedToast: boolean
  didDismissSignInToast: boolean
  needsMigration: boolean
  didMigrate: boolean
}

const INITIAL_STATE: DashboardState = {
  didCreate: false,
  didSync: false,
  didDismissSyncedToast: false,
  didDismissSignInToast: false,
  needsMigration: false,
  didMigrate: false
}

type DashboardReducerAction = CreateProjectAction | DismissSignInToastAction | DismissSyncedToastAction | SetSyncAction

export const dashboardReducer = (state = INITIAL_STATE, action: DashboardReducerAction): DashboardState => {
  switch (action.type) {
    case CREATE_PROJECT: {
      return {
        ...state,
        didCreate: true
      }
    }
    case SET_SYNC: {
      return { ...state, didSync: action.payload.didSync }
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
