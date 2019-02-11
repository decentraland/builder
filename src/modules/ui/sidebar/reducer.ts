import { TOGGLE_SIDEBAR, ToggleSidebarAction, OPEN_EDITOR, OpenEditorAction } from 'modules/editor/actions'
import { SelectAssetPackAction, SearchAssetsAction, SELECT_ASSET_PACK, SEARCH_ASSETS } from './actions'

export type SidebarState = {
  selectedAssetPackId: string | null
  search: string
}

const INITIAL_STATE: SidebarState = {
  selectedAssetPackId: null,
  search: ''
}

export type SidebarReducerAction = SelectAssetPackAction | SearchAssetsAction | ToggleSidebarAction | OpenEditorAction

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
    case OPEN_EDITOR: {
      return {
        ...state,
        search: ''
      }
    }

    default:
      return state
  }
}
