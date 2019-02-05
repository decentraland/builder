import { SelectAssetPackAction, SearchAssetsAction, SELECT_ASSET_PACK, SEARCH_ASSETS } from './actions'
import { TOGGLE_SIDEBAR, ToggleSidebarAction } from 'modules/editor/actions'

export type SidebarState = {
  selectedAssetPackId: string | null
  search: string
}

const INITIAL_STATE: SidebarState = {
  selectedAssetPackId: null,
  search: ''
}

export type SidebarReducerAction = SelectAssetPackAction | SearchAssetsAction | ToggleSidebarAction

export const sidebarReducer = (state = INITIAL_STATE, action: SidebarReducerAction): SidebarState => {
  switch (action.type) {
    case SELECT_ASSET_PACK: {
      return {
        ...state,
        selectedAssetPackId: action.payload.assetPackId
      }
    }
    case SEARCH_ASSETS: {
      return {
        ...state,
        search: action.payload.search.toLowerCase().trim()
      }
    }
    case TOGGLE_SIDEBAR: {
      if (action.payload.enabled) {
        return {
          ...state,
          search: ''
        }
      }
      return state
    }

    default:
      return state
  }
}
