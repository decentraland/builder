export type DashboardState = {
  didSync: boolean
  needsMigration: boolean
  didMigrate: boolean
}

const INITIAL_STATE: DashboardState = {
  didSync: false,
  needsMigration: false,
  didMigrate: false
}

export const dashboardReducer = (state = INITIAL_STATE): DashboardState => state
