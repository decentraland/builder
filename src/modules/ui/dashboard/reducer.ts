import { CREATE_PROJECT, CreateProjectAction } from 'modules/project/actions'

export type DashboardState = {
  didCreate: boolean
  didSync: boolean
  needsMigration: boolean
  didMigrate: boolean
}

const INITIAL_STATE: DashboardState = {
  didCreate: false,
  didSync: false,
  needsMigration: false,
  didMigrate: false
}

type DashboardReducerAction = CreateProjectAction

export const dashboardReducer = (state = INITIAL_STATE, action: DashboardReducerAction): DashboardState => {
  switch (action.type) {
    case CREATE_PROJECT: {
      return {
        ...state,
        didCreate: true
      }
    }
    default:
      return state
  }
}
