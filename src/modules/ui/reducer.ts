import { combineReducers } from 'redux'
import { sidebarReducer as sidebar, SidebarState } from './sidebar/reducer'
import { dashboardReducer as dashboard, DashboardState } from './dashboard/reducer'

export type UIState = {
  sidebar: SidebarState
  dashboard: DashboardState
}

export const uiReducer = combineReducers({
  sidebar,
  dashboard
})
