import { OPEN_EDITOR, OpenEditorAction } from 'modules/editor/actions'
import {
  ToggleAssetPackAction,
  SearchAssetsAction,
  TOGGLE_ASSET_PACK,
  SEARCH_ASSETS,
  SetSidebarViewAction,
  SET_SIDEBAR_VIEW,
  SELECT_CATEGORY,
  SelectCategoryAction,
  SET_AVAILABLE_ASSET_PACKS,
  setAvailableAssetPacksAction
} from './actions'
import { SidebarView } from './types'

export type SidebarState = {
  selectedAssetPackIds: string[]
  availableAssetPackIds: string[]
  selectedCategory: string | null
  search: string
  view: SidebarView
}

const INITIAL_STATE: SidebarState = {
  selectedAssetPackIds: [],
  availableAssetPackIds: [],
  selectedCategory: null,
  search: '',
  view: SidebarView.GRID
}

export type SidebarReducerAction =
  | ToggleAssetPackAction
  | SearchAssetsAction
  | OpenEditorAction
  | SetSidebarViewAction
  | SelectCategoryAction
  | setAvailableAssetPacksAction

export const sidebarReducer = (state = INITIAL_STATE, action: SidebarReducerAction): SidebarState => {
  switch (action.type) {
    case TOGGLE_ASSET_PACK: {
      const { assetPackId, enabled } = action.payload
      const selectedAssetPackIds = state.selectedAssetPackIds.filter(id => id !== assetPackId)
      return {
        ...state,
        selectedAssetPackIds: enabled ? [...selectedAssetPackIds, assetPackId] : selectedAssetPackIds
      }
    }
    case SEARCH_ASSETS: {
      return {
        ...state,
        search: action.payload.search.toLowerCase().trim()
      }
    }
    case SET_SIDEBAR_VIEW: {
      return {
        ...state,
        view: action.payload.view,
        selectedCategory: null
      }
    }
    case SELECT_CATEGORY: {
      return {
        ...state,
        search: '',
        selectedCategory: action.payload.category
      }
    }
    case OPEN_EDITOR: {
      return INITIAL_STATE
    }

    case SET_AVAILABLE_ASSET_PACKS: {
      return {
        ...state,
        availableAssetPackIds: action.payload.assetPackIds
      }
    }

    default:
      return state
  }
}
