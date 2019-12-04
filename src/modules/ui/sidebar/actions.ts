import { action } from 'typesafe-actions'
import { SidebarView } from './types'

// Select Asset Pack

export const SELECT_ASSET_PACK = 'Select asset pack'

export const selectAssetPack = (assetPackId: string | null) => action(SELECT_ASSET_PACK, { assetPackId })

export type SelectAssetPackAction = ReturnType<typeof selectAssetPack>

// Search Assets

export const SEARCH_ASSETS = 'Search assets'

export const searchAssets = (search: string) => action(SEARCH_ASSETS, { search })

export type SearchAssetsAction = ReturnType<typeof searchAssets>

// Select Category

export const SELECT_CATEGORY = 'Select category'

export const selectCategory = (category: string | null) => action(SELECT_CATEGORY, { category })

export type SelectCategoryAction = ReturnType<typeof selectCategory>

// Set sidebar view

export const SET_SIDEBAR_VIEW = 'Set sidebar view'

export const setSidebarView = (view: SidebarView) => action(SET_SIDEBAR_VIEW, { view })

export type SetSidebarViewAction = ReturnType<typeof setSidebarView>

// Toogle scripts

export const TOGGLE_SCRIPTS = 'Toggle scripts'

export const toggleScripts = (value: boolean) => action(TOGGLE_SCRIPTS, { value })

export type ToggleScriptsAction = ReturnType<typeof toggleScripts>
