import { combineReducers } from 'redux'
import { sidebarReducer as sidebar, SidebarState } from './sidebar/reducer'
import { dashboardReducer as dashboard, DashboardState } from './dashboard/reducer'
import { collectionReducer as collection, CollectionState } from './collection/reducer'
import { landReducer as land, LandState } from './land/reducer'
import { CreateMultipleItemsState, createMultipleItemsReducer as createMultipleItems } from './createMultipleItems/reducer'
import { ThirdPartyReducer as thirdParty } from './thirdparty/reducer'
import { ThirdPartyState } from './thirdparty/reducer'

export type UIState = {
  sidebar: SidebarState
  dashboard: DashboardState
  collection: CollectionState
  land: LandState
  createMultipleItems: CreateMultipleItemsState
  thirdParty: ThirdPartyState
}

export const uiReducer = combineReducers({
  sidebar,
  dashboard,
  collection,
  land,
  createMultipleItems,
  thirdParty
})
