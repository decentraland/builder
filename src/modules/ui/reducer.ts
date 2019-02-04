import { combineReducers } from 'redux'
import { sidebarReducer as sidebar, SidebarState } from 'modules/ui/sidebar/reducer'

export type UIState = {
  sidebar: SidebarState
}

export const uiReducer = combineReducers({
  sidebar
})
