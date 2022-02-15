import { combineReducers } from 'redux'
import { sidebarReducer as sidebar, SidebarState } from './sidebar/reducer'
import { dashboardReducer as dashboard, DashboardState } from './dashboard/reducer'
import { landReducer as land, LandState } from './land/reducer'
import { CreateMultipleItemsState, createMultipleItemsReducer as createMultipleItems } from './createMultipleItems/reducer'

export type UIState = {
  sidebar: SidebarState
  dashboard: DashboardState
  land: LandState
  createMultipleItems: CreateMultipleItemsState
}

export const uiReducer = combineReducers({
  sidebar,
  dashboard,
  land,
  createMultipleItems
})
