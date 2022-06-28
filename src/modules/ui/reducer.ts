import { combineReducers } from 'redux'
import { sidebarReducer as sidebar, SidebarState } from './sidebar/reducer'
import { dashboardReducer as dashboard, DashboardState } from './dashboard/reducer'
import { collectionReducer as collection, CollectionState } from './collection/reducer'
import { landReducer as land, LandState } from './land/reducer'
import { CreateMultipleItemsState, createMultipleItemsReducer as createMultipleItems } from './createMultipleItems/reducer'
import { TPApprovalFlowReducer as tpApprovalFlow } from './tpApprovalFlow/reducer'
import { TPApprovalFlowState } from './tpApprovalFlow/reducer'

export type UIState = {
  sidebar: SidebarState
  dashboard: DashboardState
  collection: CollectionState
  land: LandState
  createMultipleItems: CreateMultipleItemsState
  tpApprovalFlow: TPApprovalFlowState
}

export const uiReducer = combineReducers({
  sidebar,
  dashboard,
  collection,
  land,
  createMultipleItems,
  tpApprovalFlow
})
