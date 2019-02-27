import { OPEN_EDITOR, OpenEditorAction } from 'modules/editor/actions'
import {
  SelectAssetPackAction,
  SearchAssetsAction,
  SELECT_ASSET_PACK,
  SEARCH_ASSETS,
  SetSidebarViewAction,
  SET_SIDEBAR_VIEW,
  SELECT_CATEGORY,
  SelectCategoryAction
} from './actions'
import { SidebarView } from './types'

export type SidebarState = {
  selectedAssetPackId: string | null
  selectedCategory: string | null
  search: string
  view: SidebarView
}

const INITIAL_STATE: SidebarState = {
  selectedAssetPackId: null,
  selectedCategory: null,
  search: '',
  view: SidebarView.GRID
}

export type SidebarReducerAction =
  | SelectAssetPackAction
  | SearchAssetsAction
  | OpenEditorAction
  | SetSidebarViewAction
  | SelectCategoryAction

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

    default:
      return state
  }
}
