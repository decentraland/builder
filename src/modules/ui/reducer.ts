import { combineReducers } from 'redux'
import { sidebarReducer as sidebar, SidebarState } from './sidebar/reducer'
import { dashboardReducer as dashboard, DashboardState } from './dashboard/reducer'
import { landReducer as land, LandState } from './land/reducer'
import { ItemEditorState, itemEditorReducer as itemEditor } from './itemEditor/reducer'

export type UIState = {
  sidebar: SidebarState
  dashboard: DashboardState
  land: LandState
  itemEditor: ItemEditorState
}

export const uiReducer = combineReducers({
  sidebar,
  dashboard,
  land,
  itemEditor
})
