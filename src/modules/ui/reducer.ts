import { combineReducers } from 'redux'
import { sidebarReducer as sidebar, SidebarState } from './sidebar/reducer'
import { dashboardReducer as dashboard, DashboardState } from './dashboard/reducer'
import { landReducer as land, LandState } from './land/reducer'
import { ItemEditorState, itemEditorReducer as itemEditor } from './itemEditor/reducer'
import { CreateMultipleItemsState, createMultipleItemsReducer as createMultipleItems } from './createMultipleItems/reducer'

export type UIState = {
  sidebar: SidebarState
  dashboard: DashboardState
  land: LandState
  itemEditor: ItemEditorState
  createMultipleItems: CreateMultipleItemsState
}

export const uiReducer = combineReducers({
  sidebar,
  dashboard,
  land,
  itemEditor,
  createMultipleItems
})
