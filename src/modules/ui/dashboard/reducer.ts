import { SaveProjectSuccessAction, SAVE_PROJECT_SUCCESS } from 'modules/sync/actions'

export type DashboardState = {
  didSyncProjects: boolean
}

const INITIAL_STATE: DashboardState = {
  didSyncProjects: false
}

type DashboardReducerAction = SaveProjectSuccessAction

export const dashboardReducer = (state = INITIAL_STATE, action: DashboardReducerAction): DashboardState => {
  switch (action.type) {
    case SAVE_PROJECT_SUCCESS: {
      return state
    }
    default:
      return state
  }
}
